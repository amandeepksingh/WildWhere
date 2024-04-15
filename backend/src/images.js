//imports
const express = require('express')
const Pool = require('pg').Pool;
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises;
const fsAsync = require('fs');
const AWSs3Module = require('@aws-sdk/client-s3');
const AWSPreSigner = require('@aws-sdk/s3-request-presigner');
require('dotenv').config({path: "../.env"});

//creates DB connection
const pool = new Pool({
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
	// ssl: {
	// 	rejectUnauthorized:false
	// } //used only on EC2
});

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
images.post('/userProfilePic/upload', imageUpload.fields([{name: 'uid'}, {name: 'img', maxCount: 1}]), (req, res, next) => userImgUpload(req, res, next))
images.delete('/userProfilePic/delete', imageUpload.fields([{name: 'uid'}]), (req, res, next) => userImgDelete(req, res, next)) 
images.post('/postPic/upload', imageUpload.fields([{name: 'uid'}, {name: 'pid'}, {name: 'img', maxCount: 1}]), (req, res, next) => postImgUpload(req, res, next))
images.delete('/postPic/delete', imageUpload.fields({name: 'uid'}, {name: 'pid'}), (req, res, next) => postImgDelete(req, res, next)) 

//s3 helper functions
function s3Put(localPath, uploadPath, extension) {
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
        Body: fsAsync.createReadStream(localPath),
        ContentType: `image/${extension.substring(1)}`
    }
    return s3Client.send(new AWSs3Module.PutObjectCommand(params))
}

function s3ListFiles(path) {
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

//returns the image URL, to be entered into the database
function s3GetSignedURL(path, fileName) {
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
        Key: `${path}/${fileName}`
    }
    return AWSPreSigner.getSignedUrl(s3Client, new AWSs3Module.GetObjectCommand(params))
}

function s3DeleteFile(path, fileName) {
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

//immediate functions
async function userImgUpload(req, res, next) {
    /**
     * @param:
     *      uid string
     *      img image
     * @returns:
     *      'image upload successful'
     *          OR
     *      error message
     */

    //parse params
    if (req.body.uid === undefined) {
        return res.status(400).json({message: 'uid is required'})
    }
    if (req.files === undefined || req.files['img'] === undefined) {
        return res.status(400).json({message: 'img must be specified'});
    }

    //getExtension of file
    const recieptPath = 'images/'
    const recieptFileName = 'unassigned'
    var extension
    await fs.readdir(recieptPath).then(files => {
        for (const file of files) {
            if (file.includes(recieptFileName)) {
                extension = path.extname(file)
                break //file located and extension assigned to variable
            }
        }
        return res.status(500).json({message: 'internal error finding recieved file'})
    })
    
    //upload to S3
    const localPath =  recieptPath + recieptFileName + extension
    const uploadPath = `users/${req.body.uid}`
    await s3Put(localPath, uploadPath, extension) //cannot produce error

    //clear local
    await fs.unlink(localPath)

    //get s3 signed url
    const url = await s3GetSignedURL('users', req.body.uid)

    //put url into db
    const query = "UPDATE users SET imgLink=$1 WHERE uid = $2"
    const vals = [url, req.body.uid]
    return pool.query(query, vals, (error, _) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            })
        }
        return res.status(200).json({message: 'image upload successful'});
    })
}


    
// //use filename directly

//         const query = idType === "post" ? `UPDATE posts SET imgLink=${json.message} WHERE pid = ${pid}` : `UPDATE users SET pfpLink=${json.message} WHERE uid = ${uid}` ;
        
//         return pool.query(query, (error, result) => {
//         if (error) {
//             return res.status(400).json({
//                 "message": error.message
//             }) //propogate errors from DB up
//         }
//         return res.status(200).json({
//             "message": result.rows
//         }) //expected return
    
//     }) })
//     .catch(err => {
//         return res.status(400).json({message: err.message})
//     })
    
    
// }

// async function imgDelete(idType, req, res, next) {
//     /**
//      * @params
//      *  idType string
//      *  id int
//      * @returns
//      *  message
//      *      or
//      *  error
//      */
//     //confirm and shorthand req vars
//     var uid
//     var pid
//     if (req.body.uid === undefined) {
//         return res.status(400).json({message: 'uid is required'})
//     } else { uid = req.body.uid }
    
//     if (idType === "user") { pid = "pfp" }
//     else if (idType === "post"){ 
//         if (req.body.pid === undefined) { return res.status(400).json({message: 'pid is required'}) }
//         else pid = req.body.pid 
//     }
    
//    /*
//     var id
//     if (idType === "user") {
//         if (req.body.uid === undefined) {
//             return res.status(400).json({message: 'uid is required'})
//         } else {
//             id = req.body.uid
//         }
//     } else if (idType === "post") {
//         if (req.body.pid === undefined) {
//             return res.status(400).json({message: 'pid is required'})
//         }
//     } //leaving open to other idTypes

//     */
   
//     const query = idType === "post" ? `UPDATE posts SET imgLink=NULL WHERE pid = ${pid}` : `UPDATE users SET pfpLink=NULL WHERE uid = ${uid}` ;
        
//     await pool.query(query, (error, result) => {
//     if (error) {
//         return res.status(400).json({
//             "message": error.message
//         }) //propogate errors from DB up
//     }
//     return res.status(200).json({
//         message: result.rows
//     }) //expected return
//     })      

//     if(res.status === 400) {
//         //error handling
//         const message = res.message;
//         return res.status(400).json({
//             "message": res.message
//         }) 
//     }

//     //get files, match file, delete file
//     return s3ListFiles(uid, pid).then(files => {
//         for (file of files) {
//             if (file.includes(`images/${uid}/${pid}/image`)) {
//                 return file
//             }
//         }
//         throw new Error("file does not exist")
//     }).then(fileName => {
//         return s3DeleteFile(res, fileName)
//     }).catch(err => {
//         return res.status(400).json({message: err.message})
//     })
// }

module.exports = images