//imports
const express = require('express')
const Pool = require('pg').Pool;
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises;
const fsAsync = require('fs');
const AWSs3Module = require('@aws-sdk/client-s3');
const AWSPreSigner = require('@aws-sdk/s3-request-presigner');
const logger = require('./logger');
require('dotenv').config({path: "../.env"});

//creates DB connection
var pool;
var poolObj = {
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
};
if(process.env.location !== "local") poolObj.ssl = {rejectUnauthorized: false}; //for server pool
pool = new Pool(poolObj);

//configure storage point for files
const imageStore = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images')
    },
    filename: function (req, file, cb) {
      cb(null, "unassigned" + path.extname(file.originalname))
    }
})
const imageUpload = multer({ storage: imageStore })

//configure S3Client
const s3Client = new AWSs3Module.S3Client({
    credentials: {
        accessKeyId: process.env.accessKeyID,
        secretAccessKey: process.env.secretAccessKey,
    },
    region: 'us-east-2'
})

//route to endpoints
const images = express()
images.post('/userProfilePic/upload', imageUpload.fields([{name: 'uid'}, {name: 'img', maxCount: 1}]), (req, res, next) => imgFuncs.upload("users", req, res, next))
images.delete('/userProfilePic/delete', (req, res, next) => imgFuncs.delete("users", req, res, next)) 
images.post('/postPic/upload', imageUpload.fields([{name: 'pid'}, {name: 'img', maxCount: 1}]), (req, res, next) => imgFuncs.upload("posts", req, res, next))
images.delete('/postPic/delete', (req, res, next) => imgFuncs.delete("posts", req, res, next)) 

//s3 helper functions
class s3Helpers {
    static s3Put(localStream, uploadPath, extension) {
        /**
         * puts file to s3
         * @param:
         *      path string
         *      fileName string
         *      extension string
         * @returns
         *      void
         */
        const params = {
            Bucket: process.env.accessPoint,
            Key: uploadPath,
            Body: fsAsync.createReadStream(localStream),
            ContentType: `image/${extension.substring(1)}`
        }
        return s3Client.send(new AWSs3Module.PutObjectCommand(params))
    }
    
    static s3ListFiles(path) {
        /**
         * lists file on specified path in s3
         * @param:
         *      path string
         * @returns:
         *      files on path
         * note that return is empty array if path is empty
         */
        const params = {
            Bucket: process.env.accessPoint,
            Prefix: path
        }
        return s3Client.send(new AWSs3Module.ListObjectsV2Command(params)).then(data => {
            if (data.Contents === undefined) {
                return []
            } else {
                return data.Contents.map(object => object.Key)
            }
        })
    }
    
    static s3GetSignedURL(path, fileName, extension) {
        /**
         * gets url for file in s3
         * @param:
         *      path string
         *      fileName string
         * @returns:
         *      url for file
         */
        const params = {
            Bucket: process.env.accessPoint,
            Key: `${path}/${fileName}${extension}`,
            Expires: 604800
        }
        return AWSPreSigner.getSignedUrl(s3Client, new AWSs3Module.GetObjectCommand(params))
    }
    
    static s3DeleteFile(fileName) {
        /**
         * deletes file from S3
         * @param:
         *      path string
         *      fileName string
         */
        const params = {
            Bucket: process.env.accessPoint,
            Key: fileName
        }
        return s3Client.send(new AWSs3Module.DeleteObjectCommand(params))
    }
}

class imgFuncs {
    static async clearS3(type, id) {
        /**
         * @param: type and id
         * @returns void
         */
        const files = await s3Helpers.s3ListFiles(type)
        var fileName
        for (const file of files) {
            if (file.includes(id)) {
                fileName = file
            }
        }
        if (fileName !== undefined) await s3Helpers.s3DeleteFile(fileName)
    }

    static async upload(type, req, res, next) {
        /**
         * @param:
         *      type (users or posts)     
         *      pid/uid string
         *      img image
         * @returns:
         *      'image upload successful'
         *          OR
         *      error message
         */
        logger.logRequest(req)

        //parse params
        var id
        var idVal
        if (type === "users") {
            id = "uid"
            if (req.body.uid === undefined) {
                return res.status(400).json({message: `${id} is required`})
            } else {
                idVal = req.body.uid
            }
        } else if (type === "posts") {
            id = "pid"
            if (req.body.pid === undefined) {
                return res.status(400).json({message: `${id} is required`})
            } else {
                idVal = req.body.pid
            }
        } else {
            return res.status(500).json({message: "internal error"})
        }
        if (req.files === undefined || req.files['img'] === undefined) {
            return res.status(400).json({message: 'img must be specified'});
        }
    
        const recieptPath = "images/"
        const recieptFileName = 'unassigned'
        var extension
        await fs.readdir(recieptPath).then(files => {
            for (const file of files) {
                if (file.includes(recieptFileName)) {
                    extension = path.extname(file)
                }
            }
        })
        const localPath =  `${recieptPath}${recieptFileName}${extension}`
        const uploadPath = `${type}/${idVal}${extension}`

        //clear s3 and db
        await imgFuncs.clearS3(type, idVal)
        
        //upload to S3
        await s3Helpers.s3Put(localPath, uploadPath, extension) //cannot produce error
    
        //get s3 signed url
        const url = await s3Helpers.s3GetSignedURL(type, idVal, extension)
    
        //put url into db
        const query = {
            text: `UPDATE ${type} SET imglink = $1 WHERE ${id} = $2`,
            values: [url, idVal]
        }
        logger.logQuery(query)

        return pool.query(query, (error, _) => {
            if (error) {
                return res.status(400).json({
                    "message": error.message
                })
            }
            return res.status(200).json({message: url});
        })
    }

    static async delete(type, req, res, next) {
        /**
         * @param:
         *      type string
         *      uid/pid string
         * @returns
         *      message
         *          OR
         *      error
         */
        logger.logRequest(req)

        //parse params
        var id
        var idVal
        if (type === "users") {
            id = "uid"
            if (req.body.uid === undefined) {
                return res.status(400).json({message: `${id} is required`})
            } else {
                idVal = req.body.uid
            }
        } else if (type === "posts") {
            id = "pid"
            if (req.body.pid === undefined) {
                return res.status(400).json({message: `${id} is required`})
            } else {
                idVal = req.body.pid
            }
        } else {
            return res.status(500).json({message: "internal error"})
        }

        //clear s3
        await imgFuncs.clearS3(type, idVal)

        //clear db entry
        const query = {
            text: `UPDATE ${type} SET imglink = NULL WHERE ${id} = $1`,
            values: [idVal]
        }
        logger.logQuery(query)

        return pool.query(query, (error, _) => {
            if (error) {
                return res.status(400).json({message: error.message})
            }
            res.status(200).json({message: "image delete successful"})
        })
    }
}

module.exports = images