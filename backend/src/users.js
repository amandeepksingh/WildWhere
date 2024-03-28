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
	ssl: {
		rejectUnauthorized:false
	}
});

//creates users and routes methods and endpoints to functions
const users = express();
users.get('/selectUser', (req, res, next) => selectUser(req, res, next))
/*
    @params:
        uid int (optional),
        email string (optional)
        username string (optional)
        bio string (optional)
        pfplink linkToImg (optional)
        superUser boolean (optional)
        locationPerm boolean (optional)
        notificationPerm boolean (optional)
        colorBlindrating int (optional)
    @returns:
        message []{
            uid int,
            email string,
            username string,
            bio string,
            pfplink linkToImg,
            superUser boolean,
            locationPerm boolean,
            notificationPerm boolean,
            colorBlindrating int
        }
*/
users.post('/createUser', (req, res, next) => createUser(req, res, next))
/*
    @params:
        uid int (required),
        email string (optional)
        username string (optional)
        bio string (optional)
        pfplink linkToImg (optional)
        superUser boolean (optional)
        locationPerm boolean (optional)
        notificationPerm boolean (optional)
        colorBlindrating int (optional)
    @returns:
        message string 
            `user with uid ${testInput.uid} created`
            error message
*/
users.put('/updateUserByUID', (req, res, next) => updateUserByUID(req, res, next))
/*
    @params:
        uid int (required),
        email string (optional)
        username string (optional)
        bio string (optional)
        pfplink linkToImg (optional)
        superUser boolean (optional)
        locationPerm boolean (optional)
        notificationPerm boolean (optional)
        colorBlindRating int (optional)
    @returns:
        message string:
            `user with uid ${uid} updated`
            error message
*/
users.delete('/deleteUserByUID', (req, res, next) => deleteUserByUID(req, res, next))
/*
    @params:
        uid int (required)
    @returns:
        message string:
            `user with uid ${uid} deleted if existed`
            error message
*/

function selectUser(req, res, next) {
    var condits = ["1 = 1"] //in case nothing sent
    if (req.body.uid) {
        condits.push(`uid = ${req.body.uid}`)
    }
    if (req.body.email) {
        condits.push(`email = '${req.body.email}'`)
    }
    if (req.body.username) {
        condits.push(`username = '${req.body.username}'`)
    }
    if (req.body.bio) {
        condits.push(`bio = '${req.body.bio}'`)
    }
    if (req.body.pfpLink) {
        condits.push(`pfpLink = '${req.body.pfpLink}'`)
    }
    if (req.body.superUser) {
        condits.push(`superUser = ${req.body.superUser}`)
    }
    if (req.body.locationPerm) {
        condits.push(`locationPerm = ${req.body.locationPerm}`)
    }
    if (req.body.notificationPerm) {
        condits.push(`notificationPerm = ${req.body.notificationPerm}`)
    }
    if (req.body.colorBlindRating) {
        condits.push(`colorBlindRating = ${parseInt(req.body.colorBlindRating)}`)
    }
    vals = condits.join(' AND ')
    const query = `SELECT * FROM users WHERE ${vals}`
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
    var dict = {}
    //NO UID, AUTO-INCREMENT STARTING FROM 2
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
    const query = Object.keys(dict).length == 0 ? `INSERT INTO users VALUES(DEFAULT)` : `INSERT INTO users(${fields}) VALUES(${vals})`
    return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            })
        }
        return res.status(200).json({
            message: `user created`
        })
    })
}

function updateUserByUID(req, res, next) {
    var updates = []
    if (req.body.uid === undefined) {
        return res.status(400).json({
            "message": "missing uid"
        }) //handles misformatted input
    }
    if (req.body.email) {
        updates.push(`email = '${req.body.email}'`)
    }
    if (req.body.username) {
        updates.push(`username = '${req.body.username}'`)
    }
    if (req.body.bio) {
        updates.push(`bio = '${req.body.bio}'`)
    }
    if (req.body.pfpLink) {
        updates.push(`pfpLink = '${req.body.pfpLink}'`)
    }
    if (req.body.superUser) {
        updates.push(`superUser = ${req.body.superUser}`)
    }
    if (req.body.locationPerm) {
        updates.push(`locationPerm = ${req.body.locationPerm}`)
    }
    if (req.body.notificationPerm) {
        updates.push(`notificationPerm = ${req.body.notificationPerm}`)
    }
    if (req.body.colorBlindRating) {
        updates.push(`colorBlindRating = ${parseInt(req.body.colorBlindRating)}`)
    }
    vals = updates.join(', ')
    const query = `UPDATE users SET ${vals} WHERE uid = ${parseInt(req.body.uid)}`
    return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            })
        }
        return res.status(200).json({
            message: `user with uid ${req.body.uid} updated`
        })
    })
}

function deleteUserByUID(req, res, next) {
    if (req.body.uid === undefined) {
        return res.status(400).json({
            "message": "missing uid"
        }) //handles misformatted input
    }
    
    return pool.query("DELETE FROM users WHERE uid = $1", [req.body.uid], (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            })
        }
        return res.status(200).json({
            message: `user with uid ${req.body.uid} deleted if existed`
        })
    })
}


//exports users to app
module.exports = users;