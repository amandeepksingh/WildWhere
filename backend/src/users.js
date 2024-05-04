//imports
const express = require('express')
const Pool = require('pg').Pool;
const {s3Helpers, images} = require('./images');
const logger = require('./logger');
require('dotenv').config({path: "../.env"});

//creates DB connection
var poolParams = {
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
};
if(process.env.location !== "local") poolParams.ssl = {rejectUnauthorized: false}; //for server pool
const pool = new Pool(poolParams);

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
    var responseStatus, responseJson
    logger.logRequest(req)

    //parse req.query into db query
    const rawConditions = req.query;
    const conditionsAsString = Object.keys(rawConditions).map((col, i) => `${col} = $${i + 1}`).join(" AND ")
    const query = Object.keys(rawConditions).length === 0 ? "SELECT * FROM users" //if user sends query with extra fields, it's caught by DB and propogates up
        : {
            text: `SELECT * FROM users WHERE ${conditionsAsString}`,
            values: Object.values(rawConditions)
        }
    logger.logQuery(query)

    //send db query and return response
    return pool.query(query, async (error, result) => {
        if (error) {
            logger.logDBerr(error);
            responseStatus = 400
            responseJson = {message: error.message}
            logger.logResponse(responseStatus, responseJson)
            return res.status(responseStatus).json(responseJson)
        }
        logger.logDBsucc(result);
        responseStatus = 200
        responseJson = {message: result.rows}
        logger.logResponse(responseStatus, responseJson)

        if(result.rows && result.rows.length > 0) {
            //request a new signedurl
            if(result.rows[0].imglink != null) {
                const toks = result.rows[0].imglink.split("/");
                if(toks.length === 3) {
                    const url = await s3Helpers.s3GetSignedURL(toks[0], toks[1], toks[2]);
                    result.rows[0].imglink = url;
                }
            }
        }
        responseJson = {message: result.rows};
        return res.status(200).json(responseJson);
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
    var responseStatus, responseJson
    logger.logRequest(req)
    
    //parse valid elements of req.body into params array
    const columns = ["uid", "email", "username", "bio", "pfpLink", "superUser", "imglink", "locationPerm", "notificationPerm", "colorBlindRating"]
    var params = {}
    for(const col of columns) {
        if(req.body[col] !== undefined) {
            params[col] = req.body[col]
        } else if (req.body[col.toLowerCase()] !== undefined) {
            params[col] = req.body[col.toLowerCase()]
        }
    }
    //check that params array contains required uid
    if(params.uid === undefined) {
        logger.logInvalidInput("uid is required")
        responseStatus = 400
        responseJson = {message: "uid is required"}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }
    //parse params array into db query
    const paramsAsString = Object.keys(params).join(', ')
    const placeholders = Object.keys(params).map((_, i) => `$${i + 1}`).join(', ')
    const query = Object.keys(params).length === 0 ? "INSERT INTO users VALUES(DEFAULT)"
        : {
            text: `INSERT INTO users(${paramsAsString}) VALUES(${placeholders})`,
            values: Object.values(params)
        }
    logger.logQuery(query)
    
    // send db query and return response
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
        responseJson = {message: "user created", uid: params.uid}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
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
    var responseStatus, responseJson
    logger.logRequest(req)

    //parse valid elements of req.body into columns array
    const columns = ["email", "username", "bio", "imgLink", "superUser", "locationPerm", "notificationPerm", "colorBlindRating"]
    var params = {}
    for(const col of columns) {
        if(req.body[col] !== undefined) {
            params[col] = req.body[col]
        } else if (req.body[col.toLowerCase()] !== undefined) {
            params[col] = req.body[col.toLowerCase()]
        }
    }
    //check that req contains required uid
    if(req.body.uid === undefined) {
        responseStatus = 400
        responseJson = {message: "uid is required"}
        logger.logInvalidInput(responseJson.message)
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }
    //check that there is at least one update
    if (Object.keys(params).length == 0) {
        logger.logInvalidInput("at least one update is required")
        responseStatus = 400
        responseJson = {message: "at least one update is required"}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }
    //parse columns array into db query
    const paramsAsString = Object.keys(params).map((col, i) => `${col} = $${i + 1}`).join(", ")
    const query = {
        text: `UPDATE users SET ${paramsAsString} WHERE uid = $${Object.keys(params).length + 1}`,
        values: Object.values(params).concat([ req.body.uid ])
    }
    logger.logQuery(query)
    
    //send db query and return response
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
        responseJson = {message: `user with uid ${req.body.uid} updated`}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    })
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
    var responseStatus, responseJson
    logger.logRequest(req)

    //check that req contains required uid
    if(req.query.uid === undefined) {
        responseStatus = 400
        responseJson = {message: "uid is required"}
        logger.logInvalidInput(responseJson.message)
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }
    //create db query
    const query = {
        text: "DELETE FROM users WHERE uid = $1",
        values: [req.query.uid]
    }
    logger.logQuery(query)

    //send query to db and return response
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
        responseJson = {message: `user with uid ${req.query.uid} deleted if existed`}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    })
}

//exports users to app
module.exports = users;