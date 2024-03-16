//imports
const express = require('express')
const Pool = require('pg').Pool;
require('dotenv').config();

//creates DB connection
const pool = new Pool({
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
	// ssl: {
	// 	rejectUnauthorized:process.env.rejectUnauthorized
	// } //used only on EC2
});

//creates users and routes methods and endpoints to functions
const users = express();
users.get('/selectUserByID', (req, res, next) => selectUserByID(req, res, next))
users.post('/createUser', (req, res, next) => createUser(req, res, next))
users.put('/updateUser', (req, res, next) => updateUser(req, res, next))
users.delete('/deleteUser', (req, res, next) => deleteUserByID(req, res, next))

function selectUserByID(req, res, next) {
    /*
    takes in a req with a 'uid' int
    runs SELECT query for users with uid equal to arg
    returns the result
    */
    if (req.body.uid === undefined) {
        return res.status(400).json({
            "message": "missing uid field"
        }) //handles misformatted input
    }
    query = `SELECT * FROM users WHERE uid='${req.body.uid}'`
    return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            }) //propogate errors from DB up
        }
        return res.status(200).json({
            message: result.rows
        }) //expected return
    })
}

function createUser(req, res, next) {
    /*
    takes in a req with the user parameters:
        uid int (required)
        email string (optional)
        username string (optional)
        bio string (optional)
        pfplink linkToImg (optional)
        superUser boolean (optional)
        locationPerm boolean (optional)
        notificationPerm boolean (optional)
        colorBlindrating int (optional)
    returns uid of created user as confirmation
    */
    var dict = {}
    if (req.body.uid) {
        dict['uid'] = parseInt(req.body.uid)
    } else {
        return res.status(400).json({
            "message": "missing uid"
        }) //handles misformatted input
    }
    if (req.body.email) {
        dict['email'] = `'${req.body.email}'`
    }
    if (req.body.username) {
        dict['username'] = `'${req.body.username}'`
    }
    if (req.body.bio) {
        dict['bio'] = `'${req.body.bio}'`
    }
    if (req.body.pfpLink) {
        dict['pfpLink'] = `'${req.body.pfpLink}'`
    }
    if (req.body.superUser) {
        dict['superUser'] = req.body.superUser
    }
    if (req.body.locationPerm) {
        dict['locationPerm'] = req.body.locationPerm
    }
    if (req.body.notificationPerm) {
        dict['notificationPerm'] = req.body.notificationPerm
    }
    if (req.body.colorBlindRating) {
        dict['colorBlindRating'] = parseInt(req.body.colorBlindRating)
    }
    const fields = Object.keys(dict).join(','),
        vals = Object.values(dict).join(',')
    const query = `INSERT INTO users(${fields}) VALUES(${vals})`
    return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            })
        }
        return res.status(200).json({
            message: `user with uid ${req.body.uid} created`
        })
    })
}

function updateUser(req, res, next) {
    //TODO
}

function deleteUser(req, res, next) {
    //TODO
}


//exports users to app
module.exports = users;