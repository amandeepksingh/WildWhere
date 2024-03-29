//imports
const express = require('express')
const multer = require('multer')
const path = require('node:path')

//configure storage point for files
const userImages = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images/user')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, "user" + uniqueSuffix + path.extname(file.originalname))
    }
})
const userImageUpload = multer({ storage: userImages })

const postImages = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images/post')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, "user" + uniqueSuffix + path.extname(file.originalname))
    }
})
const postImageUpload = multer({ storage: postImages })

const images = express()

images.post('/user', userImageUpload.fields([{name: 'UID'}, {name: 'img', maxCount: 1}]), (req, res, next) => uploadUserImage(req, res, next))
images.post('/post', postImageUpload.fields([{name: 'PID'}, {name: 'img', maxCount: 1}]), (req, res, next) => uploadPostImage(req, res, next))

function uploadUserImage(req, res, next) {
    /**
     * @param
     *  UID string
     *  img image
     * @returns
     *  image upload successful
     *      OR
     *  error message
     */
    //TODO
    return "image upload successful"
}

function uploadPostImage(req, res, next) {
    /**
     * @param
     *  PID string
     *  img image
     * @returns
     *  image upload successful
     *      OR
     *  error message
     */
    //TODO
    return "image upload successful"
}

module.exports = images