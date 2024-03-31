//imports
const express = require('express')
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

function s3ListFiles(type) {
    const params = {
        Bucket: process.env.accessPoint,
        Prefix: `images/${type}/`
    }
    return s3Client.send(new AWSs3Module.ListObjectsV2Command(params)).then(data => {
        if (data.Contents === undefined) throw new Error('file does not exist')
        return data.Contents.map(object => object.Key)
    })
}

function s3DownloadFile(res, fileName) {
    const params = {
        Bucket: process.env.accessPoint,
        Key: fileName
    }
    return AWSPreSigner.getSignedUrl(s3Client, new AWSs3Module.GetObjectCommand(params)).then(url => {
        res.status(200).json({message:url})
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

const images = express()

images.post('/upload', imageUpload.fields([{name: 'type'}, {name: 'id'}, {name: 'img', maxCount: 1}]), (req, res, next) => imgUpload(req, res, next))
images.get('/access', imageUpload.none(), (req, res, next) => imgAccess(req, res, next))
images.delete('/delete', imageUpload.none(), (req, res, next) => imgDelete(req, res, next)) 

async function imgUpload(req, res, next) {
    /**
     * @param
     *  type string
     *  id int
     *  img image
     * @returns
     *  image upload successful
     *      OR
     *  error message
     */
    //confirm and shorthand params
    if (req.body.type === undefined || (req.body.type !== "user" && req.body.type !== "post")) {
        return res.status(400).json({message: "type must be specified. Supports 'user' and 'post'"})
    }
    const idType = req.body.type
    if (req.body.id === undefined) {
        return res.status(400).json({message: "id must be specified"})
    }
    const id = req.body.id
    if (req.files === undefined || req.files['img'] === undefined) {
        return res.status(400).json({message: 'img must be specified'});
    }
    
    //get file and extension
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
    const oldName = `${filePath}${defaultBasename}${extension}`
    
    //rename file
    const newName = `${filePath}${idType}/${id}${extension}`
    await fs.rename(oldName, newName).catch(err => {
        return res.status(400).json({message: `Backend logic error: ${err.message}`})
    })

    //upload to s3 and clear local
    const contentType = `image/${extension.substring(1)}`
    return s3Put(res, newName, contentType).then(res => {
        fs.unlink(newName)
        return res
    }).catch(err => {
        return res.status(400).json({message: err.message})
    })
}

async function imgAccess(req, res, next) {
    /**
     * @param
     *  type string
     *  id int
     * @returns
     *  img image
     *      or
     *  error message
     */
    //confirm and shorthand params
    if (req.body.type === undefined) {
        return res.status(400).json({message: "type must be specified. Supports 'user' and 'post'"})
    }
    const type = req.body.type
    if (req.body.id === undefined) {
        return res.status(400).json({message: "id must be specified"})
    }
    const id = req.body.id

    //get files, match file, download file
    return s3ListFiles(type).then(files => {
        for (file of files) {
            if (file.includes(`images/${type}/${id}`)) {
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

async function imgDelete(req, res, next) {
    /**
     * @params
     *  type string
     *  id int
     * @returns
     *  message
     *      or
     *  error
     */
    //confirm and shorthand req vars
    if (req.body.type === undefined) {
        return res.status(400).json({message: 'type is required'})
    }
    const type = req.body.type
    if (req.body.id === undefined) {
        return res.status(400).json({message: 'id is required'})
    }
    const id = req.body.id

    //get files, match file, delete file
    return s3ListFiles(type).then(files => {
        for (file of files) {
            if (file.includes(`images/${type}/${id}`)) {
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