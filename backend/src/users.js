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
    const columns = ["uid", "email", "username", "bio", "pfpLink", "superUser", "locationPerm", "notificationPerm", "colorBlindRating"]
    var condits = {}
    for(const col of columns) {
        if(req.body[col]) {
            condits[col] = req.body[col]
        }
    }

    const conditString = Object.keys(condits).map((col, i) => `${col} = $${i + 1}`).join(" AND ")
    const query = Object.keys(condits).length === 0 ? "SELECT * FROM users"
        : {
            text: `SELECT * FROM users WHERE ${conditString}`,
            values: Object.values(condits)
        }

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
    //NO UID, AUTO-INCREMENT STARTING FROM 2
    const columns = ["email", "username", "bio", "pfpLink", "superUser", "locationPerm", "notificationPerm", "colorBlindRating"]
    var dict = {}
    for(const col of columns) {
        if(req.body[col]) {
            dict[col] = req.body[col]
        }
    }

    const fields = Object.keys(dict).join(', ')
    const placeholders = Object.keys(dict).map((_, i) => `$${i + 1}`).join(', ')
    const query = 
        Object.keys(dict).length === 0 ? "INSERT INTO users VALUES(DEFAULT)"
        : {
            text: `INSERT INTO users(${fields}) VALUES(${placeholders})`,
            values: Object.values(dict)
        }
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
    if (req.body.uid === undefined) {
        return res.status(400).json({
            "message": "missing uid"
        }) //handles misformatted input
    }

    const columns = ["email", "username", "bio", "pfpLink", "superUser", "locationPerm", "notificationPerm", "colorBlindRating"]
    const updates = {}
    for(const col of columns) {
        if(req.body[col]) {
            updates[col] = req.body[col]
        }
    }

    const len = Object.keys(updates).length
    if(len > 0) {
        const updateString = Object.keys(updates).map((col, i) => `${col} = $${i + 1}`).join(", ")
        const query = {
            text: `UPDATE users SET ${updateString} WHERE uid = $${len + 1}`,
            values: Object.values(updates).concat([ req.body.uid ])
        }

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