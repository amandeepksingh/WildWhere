//imports
const express = require('express')
const Pool = require('pg').Pool;
const logger = require('./logger');
require('dotenv').config({path: "../.env"});

//creates DB connection
let pool;
if(process.env.location == "local") {
	console.log(`[Users] using local pool`);
     pool = new Pool({
        user: process.env.dbUser,
        host: process.env.dbHost,
        database: process.env.dbName,
        password: process.env.dbPass,
        port: process.env.dbPort,
        // ssl: {
        // 	rejectUnauthorized:false
        // } //used only on EC2
    });    
} else {
	console.log(`[Users] using server pool`);
     pool = new Pool({
        user: process.env.dbUser,
        host: process.env.dbHost,
        database: process.env.dbName,
        password: process.env.dbPass,
        port: process.env.dbPort,
        ssl: {
        	rejectUnauthorized:false
        } //used only on EC2
    });
}



//creates users and routes methods and endpoints to functions
const users = express();
users.get('/selectUser', (req, res, next) => {selectUser(req, res, next)})
users.post('/createUser', (req, res, next) => createUser(req, res, next))
users.put('/updateUserByUID', (req, res, next) => updateUserByUID(req, res, next))
users.delete('/deleteUserByUID', (req, res, next) => deleteUserByUID(req, res, next))

function selectUser(req, res, next) {
    /**
     * @param:
     *  uid string (optional),
     *  email string (optional)
     *  username string (optional)
     *  bio string (optional)
     *  imgLink string (optional)
     *  superUser boolean (optional)
     *  locationPerm boolean (optional)
     *  notificationPerm boolean (optional)
     *  colorBlindrating int (optional)
     * @return:
     *   message []{
     *      uid string,
     *      email string,
     *      username string,
     *      bio string,
     *      imgLink string,
     *      superUser boolean,
     *      locationPerm boolean,
     *      notificationPerm boolean,
     *      colorBlindrating int
     *  }
     */
    logger.log(`originalURL: ${JSON.stringify(req.originalUrl)} - body: ${JSON.stringify(req.body)} - headers: ${JSON.stringify(req.rawHeaders)}`)
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

    logger.log(`query: ${JSON.stringify(query)}`)
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
    /**
     * @param:
     *  uid string (optional)
     *  email string (optional)
     *  username string (optional)
     *  bio string (optional)
     *  imgLink string (optional)
     *  superUser boolean (optional)
     *  locationPerm boolean (optional)
     *  notificationPerm boolean (optional)
     *  colorBlindrating int (optional)
     * @returns:
     *  message string 
     *      "user created"
     *      OR
     *      error message
     *  uid string (on success)
     */
    logger.log(`originalURL: ${JSON.stringify(req.originalUrl)} - body: ${JSON.stringify(req.body)} - headers: ${JSON.stringify(req.rawHeaders)}`)
    const columns = ["uid", "email", "username", "bio", "pfpLink", "superUser", "locationPerm", "notificationPerm", "colorBlindRating"]
    var dict = {}
    for(const col of columns) {
        if(req.body[col]) {
            dict[col] = req.body[col]
        }
    }

    if(dict['uid'] === undefined) {
        return res.status(400).json({message: "uid is required"})
    }

    const fields = Object.keys(dict).join(', ')
    const placeholders = Object.keys(dict).map((_, i) => `$${i + 1}`).join(', ')
    const query = 
        Object.keys(dict).length === 0 ? "INSERT INTO users VALUES(DEFAULT)"
        : {
            text: `INSERT INTO users(${fields}) VALUES(${placeholders})`,
            values: Object.values(dict)
        }
    
    logger.log(`query: ${JSON.stringify(query)}`)
    return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            })
        }
        return res.status(200).json({
            message: "user created",
            uid: dict['uid']
        })
    })
}

function updateUserByUID(req, res, next) {
    /**
     * @param:
     *  uid string (required),
     *  email string (optional)
     *  username string (optional)
     *  bio string (optional)
     *  imgLink string (optional)
     *  superUser boolean (optional)
     *  locationPerm boolean (optional)
     *  notificationPerm boolean (optional)
     *  colorBlindRating int (optional)
     * @returns:
     *  message string:
     *      `user with uid ${uid} updated`
     *      OR
     *      error message
     */
    logger.log(`originalURL: ${JSON.stringify(req.originalUrl)} - body: ${JSON.stringify(req.body)} - headers: ${JSON.stringify(req.rawHeaders)}`)
    if (req.body.uid === undefined) {
        return res.status(400).json({
            "message": "missing uid"
        }) //handles misformatted input
    }

    const columns = ["email", "username", "bio", "imgLink", "superUser", "locationPerm", "notificationPerm", "colorBlindRating"]
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

        logger.log(`query: ${JSON.stringify(query)}`)
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
    /**
     * @param:
     *   uid string (required)
     * @returns:
     *   message string:
     *      `user with uid ${uid} deleted if existed`
     *      OR
     *      error message
     */
    logger.log(`originalURL: ${JSON.stringify(req.originalUrl)} - body: ${JSON.stringify(req.body)} - headers: ${JSON.stringify(req.rawHeaders)}`)
    if (req.body.uid === undefined) {
        return res.status(400).json({
            "message": "missing uid"
        }) //handles misformatted input
    }
    
    logger.log(`query: DELETE FROM users WHERE uid = $1 - vals: ${[req.body.uid]}`)
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