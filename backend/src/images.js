//imports
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs');

//configure storage point for files
const userImages = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images/user')
    },
    filename: function (req, file, cb) {
      cb(null, "user-unassigned" + path.extname(file.originalname))
    }
})
const userImageUpload = multer({ storage: userImages })

const postImages = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images/post')
    },
    filename: function (req, file, cb) {
      cb(null, "post-unassigned" + path.extname(file.originalname))
    }
})
const postImageUpload = multer({ storage: postImages })

const images = express()

images.post('/user', userImageUpload.fields([{name: 'UID'}, {name: 'img', maxCount: 1}]), (req, res, next) => uploadUserImage(req, res, next))
images.post('/post', postImageUpload.fields([{name: 'PID'}, {name: 'img', maxCount: 1}]), (req, res, next) => uploadPostImage(req, res, next))

async function uploadUserImage(req, res, next) {
    /**
     * @param
     *  UID string
     *  img image
     * @returns
     *  image upload successful
     *      OR
     *  error message
     */
    if (req.body.uid === undefined) {
        return res.status(400).json({message: "missing uid"})
    }
    const uid = req.body.uid
    const filePath = 'images/user/'
    const defaultBasename = 'user-unassigned'
    const files = await fs.readdirSync("images/user")
    var fullFileName
    for (const file of files) {
        if (file.includes(defaultBasename)) {
            fullFileName = file
        }
    }
    const extension = path.extname(fullFileName)
    const newName = `${filePath}user-${uid}${extension}`
    const oldName = `${filePath}${defaultBasename}${extension}`
    for (const file of files) {//clear any old files with same name
        if (file.includes(`user-${uid}`)) {
            await fs.unlinkSync(`${filePath}${file}`)
        }
    }
    fs.rename(oldName, newName, (err) => {
        if (err) {
            /* istanbul ignore next */
            return res.status(400).json({message: err.message})
        }
        return res.status(200).json({message:"image upload successful"})
    })
}

async function uploadPostImage(req, res, next) {
    /**
     * @param
     *  PID string
     *  img image
     * @returns
     *  image upload successful
     *      OR
     *  error message
     */
    if (req.body.pid === undefined) {
        return res.status(400).json({message: "missing pid"})
    }
    const pid = req.body.pid
    const filePath = 'images/post/'
    const defaultBasename = 'post-unassigned'
    const files = await fs.readdirSync("images/post")
    var fullFileName
    for (const file of files) {
        if (file.includes(defaultBasename)) {
            fullFileName = file
        }
    }
    const extension = path.extname(fullFileName)
    const newName = `${filePath}post-${pid}${extension}`
    const oldName = `${filePath}${defaultBasename}${extension}`
    for (const file of files) {//clear any old files with same name
        if (file.includes(`post-${pid}`)) {
            await fs.unlinkSync(`${filePath}${file}`)
        }
    }
    fs.rename(oldName, newName, (err) => {
        if (err) {
            return res.status(400).json({message: err.message})
        }
        return res.status(200).json({message:"image upload successful"})
    })
}

module.exports = images