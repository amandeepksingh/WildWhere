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
        logger.logS3Req("PUT OBJECT", params)
        return s3Client.send(new AWSs3Module.PutObjectCommand(params)).then(resp => {
            logger.logS3PutResp(resp.$metadata.httpStatusCode)
            return resp.$metadata.httpStatusCode
        })
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
        logger.logS3Req("LIST OBJECTS", params)
        return s3Client.send(new AWSs3Module.ListObjectsV2Command(params)).then(data => {
            if (data.Contents === undefined) {
                return []
            } else {
                return data.Contents.map(object => object.Key)
            }
        }).then(contents => {
            logger.logS3Contents(path, contents)
            return contents
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
        logger.logS3Req("GET SIGNED URL", params)
        return AWSPreSigner.getSignedUrl(s3Client, new AWSs3Module.GetObjectCommand(params)).then(url => {        
            logger.logS3URL(url)
            return url
        })
    }
    
    static s3DeleteFile(fileName) {
        /**
         * deletes file from S3
         * @param:
         *      fileName string
         */
        const params = {
            Bucket: process.env.accessPoint,
            Key: fileName
        }
        logger.logS3Req("DELETE OBJECT", params)
        return s3Client.send(new AWSs3Module.DeleteObjectCommand(params)).then(resp => {
            logger.logS3Delete(resp.$metadata.httpStatusCode)
            return resp.$metadata.httpStatusCode
        })
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
        if (fileName !== undefined) {
            logger.logAlreadyInS3(type, id, true)
            return s3Helpers.s3DeleteFile(fileName)
        } else {
            logger.logAlreadyInS3(type, id, false)
            return 204 //replacing successful delete with successful inaction
        }
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
        var responseStatus, responseJson
        logger.logRequest(req)

        //parse params
        var id
        var idVal
        if (type === "users") {
            id = "uid"
            if (req.body.uid === undefined) {
                logger.logInvalidInput(`${id} is required`)
                responseStatus = 400
                responseJson = {message: `${id} is required`}
                logger.logResponse(responseStatus, responseJson)
                return res.status(responseStatus).json(responseJson)
            } else {
                idVal = req.body.uid
            }
        } else if (type === "posts") {
            id = "pid"
            if (req.body.pid === undefined) {
                logger.logInvalidInput(`${id} is required`)
                responseStatus = 400
                responseJson = {message: `${id} is required`}
                return res.status(responseStatus).json(responseJson)
            } else {
                idVal = req.body.pid
            }
        } else {
            logger.logInternalError("reached image upload for neither user nor post")
            responseStatus = 500
            responseJson = {message: "internal error: reached image upload for neither user nor post"}
            logger.logResponse(responseStatus, responseJson)
            return res.status(responseStatus).json(responseJson)
        }
        if (req.files === undefined || req.files['img'] === undefined) {
            logger.logInvalidInput(`img must be specified`)
            responseStatus = 400
            responseJson = {message: `img must be specified`}
            return res.status(responseStatus).json(responseJson)
        }
    
        //obtain file paths
        const recieptPath = "images/"
        const recieptFileName = 'unassigned'
        const extension = await fs.readdir(recieptPath).then(files => {
            for (const file of files) {
                if (file.includes(recieptFileName)) {
                    return path.extname(file)
                }
            }
            return undefined
        })
        if (extension === undefined) {
            logger.logIntenalError("file to upload not found in image directory")
            responseStatus = 500
            responseJson = {message: "internal error: file to upload not found in image directory"}
            logger.logResponse(responseStatus, responseJson)
            return res.status(responseStatus).json(responseJson)
        }
        const localPath =  `${recieptPath}${recieptFileName}${extension}`
        const uploadPath = `${type}/${idVal}${extension}`
        logger.logImgPathsParsed(localPath, uploadPath)

        //clear s3
        const deleteResp = await imgFuncs.clearS3(type, idVal)
        if (deleteResp != 204) {
            logger.logInternalError('error on delete from s3')
            responseStatus = 500
            responseJson = 'error on delete from s3'
            return res.status(responseStatus).json(responseJson)
        }
        
        //upload to S3
        const putResp = await s3Helpers.s3Put(localPath, uploadPath, extension)
        if (putResp != 200) {
            logger.logInternalError('error on put to s3')
            responseStatus = 500
            responseJson = 'error on put to s3'
            return res.status(responseStatus).json(responseJson)
        }
    
        //get s3 signed url
        const url = await s3Helpers.s3GetSignedURL(type, idVal, extension)
    
        //put url into db
        const query = {
            text: `UPDATE ${type} SET imglink = $1 WHERE ${id} = $2`,
            values: [url, idVal]
        }
        logger.logQuery(query)

        return pool.query(query, (error, result) => {
            if (error) {
                logger.logDBfail(error)
                responseStatus = 400
                responseJson = {message: error.message}
                logger.logResponse(responseStatus, responseJson)
                return res.status(responseStatus).json(responseJson)
            }
            logger.logDBsucc(result)
            responseStatus = 200
            responseJson = {message: url}
            logger.logResponse(responseStatus, responseJson)
            return res.status(responseStatus).json(responseJson)
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
        var responseStatus, responseJson
        logger.logRequest(req)

        //parse params
        var id
        var idVal
        if (type === "users") {
            id = "uid"
            if (req.body.uid === undefined) {
                logger.logInvalidInput(`${id} is required`)
                responseStatus = 400
                responseJson = {message: `${id} is required`}
                logger.logResponse(responseStatus, responseJson)
                return res.status(responseStatus).json(responseJson)
            } else {
                idVal = req.body.uid
            }
        } else if (type === "posts") {
            id = "pid"
            if (req.body.pid === undefined) {
                logger.logInvalidInput(`${id} is required`)
                responseStatus = 400
                responseJson = {message: `${id} is required`}
                return res.status(responseStatus).json(responseJson)
            } else {
                idVal = req.body.pid
            }
        } else {
            logger.logInternalError("reached image upload for neither user nor post")
            responseStatus = 500
            responseJson = {message: "internal error: reached image upload for neither user nor post"}
            logger.logResponse(responseStatus, responseJson)
            return res.status(responseStatus).json(responseJson)
        }

        //clear s3
        const deleteResp = await imgFuncs.clearS3(type, idVal)
        if (deleteResp != 204) {
            logger.logInternalError('error on delete from s3')
            responseStatus = 500
            responseJson = 'error on delete from s3'
            return res.status(responseStatus).json(responseJson)
        }

        //form db query
        const query = {
            text: `UPDATE ${type} SET imglink = NULL WHERE ${id} = $1`,
            values: [idVal]
        }
        logger.logQuery(query)

        return pool.query(query, (error, result) => {
            if (error) {
                logger.logDBfail(error)
                responseStatus = 400
                responseJson = {message: error.message}
                logger.logResponse(responseStatus, responseJson)
                return res.status(responseStatus).json(responseJson)
            }
            logger.logDBsucc(result)
            responseStatus = 200
            responseJson = {message: 'image delete successful'}
            logger.logResponse(responseStatus, responseJson)
            return res.status(responseStatus).json(responseJson)
        })
    }
}

module.exports = images