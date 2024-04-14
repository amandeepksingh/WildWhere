//imports
const express = require('express')

const Pool = require('pg').Pool;
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

const multer = require('multer')
const path = require('path')
const fs = require('fs').promises;
const fsAsync = require('fs');
const AWSs3Module = require('@aws-sdk/client-s3');
const AWSPreSigner = require('@aws-sdk/s3-request-presigner');




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
images.post('/userProfilePic/upload', imageUpload.fields([{name: 'uid'}, {name: 'img', maxCount: 1}]), (req, res, next) => imgUpload("user", req, res, next))
//images.get('/userProfilePic/access', imageUpload.none(), (req, res, next) => imgAccess("user", req, res, next)) //DELETE
images.delete('/userProfilePic/delete', imageUpload.fields([{name: 'uid'}]), (req, res, next) => imgDelete("user", req, res, next)) 
images.post('/postPic/upload', imageUpload.fields([{name: 'uid'}, {name: 'pid'}, {name: 'img', maxCount: 1}]), (req, res, next) => imgUpload("post", req, res, next))
//images.get('/postPic/access', imageUpload.none(), (req, res, next) => imgAccess("post", req, res, next)) //DELETE
images.delete('/postPic/delete', imageUpload.fields({name: 'uid'}, {name: 'pid'}), (req, res, next) => imgDelete("post", req, res, next)) 



//s3 helper functions
function s3Put(res, fileName, contentType) {
    const params = {
        Bucket: process.env.accessPoint,
        Key: fileName,
        Body: fsAsync.createReadStream(fileName),
        ContentType: contentType
    }
    return s3Client.send(new AWSs3Module.PutObjectCommand(params)).then(_ => {
        return res.status(200).json({message: "file upload successful"})
    })
}



//FILE STRUCTURE images/uid/ profile picture OR pid folder for that user
function s3ListFiles(uid, pid) {
    const prefix = `images/${uid}/${pid}`; //<--------------------------------------------------------------------------------------ASSUMPTIONL: FOLDER PATH
    const params = {
        Bucket: process.env.accessPoint,
        Prefix: prefix
    }
    return s3Client.send(new AWSs3Module.ListObjectsV2Command(params)).then(data => {
        if (data.Contents === undefined) throw new Error('file does not exist')
        return data.Contents.map(object => object.Key)
    })
}


//returns the image URL, to be entered into the database
function s3DownloadFile(res, fileName) {
    const params = {
        Bucket: process.env.accessPoint,
        Key: fileName
    }
    return AWSPreSigner.getSignedUrl(s3Client, new AWSs3Module.GetObjectCommand(params)).then(url => {
        res.status(200).json({"message":url})
    })
}

function s3DeleteFile(res, fileName) {
    const params = {
        Bucket: process.env.accessPoint,
        Key: fileName
    }
    return s3Client.send(new AWSs3Module.DeleteObjectCommand(params)).then(_ =>
        res.status(200).json({message:'file delete successful'})
    )
}

//immediate functions
async function imgUpload(idType, req, res, next) {
    /**
     * @param
     *  idType string
     *  id int
     *  img image
     * @returns
     *  image upload successful
     *      OR
     *  error message
     */
    //confirm and shorthand req vars

    //PFP -> maintain a single one, doesn't matter for posts, return link on BOTH, INSERT LINK into DB
    var uid
    var pid
    if (req.body.uid === undefined) {
        return res.status(400).json({message: 'uid is required'})
    } else { uid = req.body.uid }
    
    if (idType === "user") { pid = "pfp" }
    else if (idType === "post"){ 
        if (req.body.pid === undefined) { return res.status(400).json({message: 'pid is required'}) }
        else pid = req.body.pid 
    }

    if (req.files === undefined || req.files['img'] === undefined) {
        return res.status(400).json({message: 'img must be specified'});
    } //leaving open to other idTypes
    
    
    //get file and extension

     
    //JFR

    const filePath = 'images/'
    const defaultBasename = 'unassigned'
    var fullFileName
    await fs.readdir(filePath).then(files => {
        for (const file of files) {
            if (file.includes(defaultBasename)) {
                fullFileName = file
            }
        }
    })    
    const extension = path.extname(fullFileName)
    //ec2 FILE PATH, CHANGE LOCALLY FOR TESTING for NEW STRUCTURE
    const oldName = `${filePath}${defaultBasename}${extension}`
    
    //s3 FILE PATH -> RENAMED, FILE STRUCTURE IMPLEMENTATION
    const newName = `${filePath}${uid}/${pid}/image${extension}` //RENAMED image to image.fileType for now, will request an image name / image ID for multi-image version
    await fs.rename(oldName, newName).catch(err => {
        return res.status(400).json({message: `Backend logic error: ${err.message}`})
    })
    
    //<-------------------------------------------------------------------------------------------------------------LIST FILES DOESN'T RESOLVE, DESPITE NO CHANGES
    /*
    await s3ListFiles(uid, pid).then(files => {
        const input = `images/${uid}/${pid}/image`; //FILE PATH WITHOUT EXTENSION????
        for (file of files) { 
            if (file.includes(input)) {
                return res.status(200).json({message: `An image already exists under this name.`})       }
        } 
    })
    */
    


    //upload to s3 and clear local

    //s3 key -> FILE/FORMAT (NOT DIRECTORY)
    const contentType = `image/${extension.substring(1)}`
    await s3Put(res, newName, contentType).then(res => {
        //PUTS on s3 and DELETES from ec2
        fs.unlink(newName)
        return res
    }).catch(err => {
        return res.status(400).json({message: err.message})
    })

    if(res.status === 400) {
        //error handling
        const message = res.message;
        return res.status(400).json({
            "message": res.message
        }) 
    }
    //s3List FILES and then Download to generate URL and upload to DB
    
//use filename directly

    return s3DownloadFile(res, newName).then(json => { //<-----------------------------------------NEVER ENTERS HERE, DOESN'T UPDATE TABLES
        //use msg.url
        //console.log(json)
        const query = idType === "post" ? `UPDATE posts SET imgLink=${json.message} WHERE pid = ${pid}` : `UPDATE users SET pfpLink=${json.message} WHERE uid = ${uid}` ;
        
        return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            }) //propogate errors from DB up
        }
        return res.status(200).json({
            "message": result.rows
        }) //expected return
    
    }) })
    .catch(err => {
        return res.status(400).json({message: err.message})
    })
    
    
}

/*
async function imgAccess(idType, req, res, next) {
    /**
     * @param
     *  idType string
     *  id int
     * @returns
     *  img image
     *      or
     *  error message
     *
    //confirm and shorthand req vars
    var id
    if (idType === "user") {
        if (req.body.uid === undefined) {
            return res.status(400).json({message: 'uid is required'})
        } else {
            id = req.body.uid
        }
    } else if (idType === "post") {
        if (req.body.pid === undefined) {
            return res.status(400).json({message: 'pid is required'})
        }
    } //leaving open to other idTypes

    //get files, match file, download file
    return s3ListFiles(idType).then(files => {
        for (file of files) {
            if (file.includes(`images/${idType}/${id}`)) {
                return file
            }
        }
        throw new Error("file does not exist")
    }).then(fileName => {
        return s3DownloadFile(res, fileName)
    }).catch(err => {
        return res.status(400).json({message: err.message})
    })
}

*/

async function imgDelete(idType, req, res, next) {
    /**
     * @params
     *  idType string
     *  id int
     * @returns
     *  message
     *      or
     *  error
     */
    //confirm and shorthand req vars
    var uid
    var pid
    if (req.body.uid === undefined) {
        return res.status(400).json({message: 'uid is required'})
    } else { uid = req.body.uid }
    
    if (idType === "user") { pid = "pfp" }
    else if (idType === "post"){ 
        if (req.body.pid === undefined) { return res.status(400).json({message: 'pid is required'}) }
        else pid = req.body.pid 
    }
    
   /*
    var id
    if (idType === "user") {
        if (req.body.uid === undefined) {
            return res.status(400).json({message: 'uid is required'})
        } else {
            id = req.body.uid
        }
    } else if (idType === "post") {
        if (req.body.pid === undefined) {
            return res.status(400).json({message: 'pid is required'})
        }
    } //leaving open to other idTypes

    */
   
    const query = idType === "post" ? `UPDATE posts SET imgLink=NULL WHERE pid = ${pid}` : `UPDATE users SET pfpLink=NULL WHERE uid = ${uid}` ;
        
    await pool.query(query, (error, result) => {
    if (error) {
        return res.status(400).json({
            "message": error.message
        }) //propogate errors from DB up
    }
    return res.status(200).json({
        message: result.rows
    }) //expected return
    })      

    if(res.status === 400) {
        //error handling
        const message = res.message;
        return res.status(400).json({
            "message": res.message
        }) 
    }

    //get files, match file, delete file
    return s3ListFiles(uid, pid).then(files => {
        for (file of files) {
            if (file.includes(`images/${uid}/${pid}/image`)) {
                return file
            }
        }
        throw new Error("file does not exist")
    }).then(fileName => {
        return s3DeleteFile(res, fileName)
    }).catch(err => {
        return res.status(400).json({message: err.message})
    })
}

module.exports = images