const express = require('express')
const Pool = require('pg').Pool;
const logger = require('./logger');
require('dotenv').config({path: "../.env"});

//creates DB connection
var pool;
var poolObj = {
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
};
if(process.env.location !== "local") poolObj.ssl = {rejectUnauthorized: false}; //for server pool
pool = new Pool(poolObj);

//creates reports and routes methods and endpoints to functions
const reports = express();
reports.get('/selectReport', (req, res, next) => selectReport(req, res, next));
reports.post('/createReport', (req, res, next) => createReport(req, res, next));

function selectReport(req, res, next) {
    /**
     * @param:
     *  pid string (optional),
     *  uid string (optional),
     *  reason string (optional)
     * @returns:
     *   message []{
     *      pid string,
     *      uid string,
     *      reason string
     *  }
     */
    var responseStatus, responseJson
    logger.logRequest(req)

    //parse req.query into db query
    const rawConditions = req.query;
    const conditionsAsString = Object.keys(rawConditions).map((col, i) => `${col} = $${i + 1}`).join(" AND ")
    const query = Object.keys(rawConditions).length === 0 ? "SELECT * FROM reports"
        : {
            text: `SELECT * FROM reports WHERE ${conditionsAsString}`,
            values: Object.values(rawConditions)
        }
    logger.logQuery(query)

    //send db query and return response
    return pool.query(query, (error, result) => {
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
        return res.status(200).json({message: result.rows})
    })
}

function createReport(req, res, next) {
    /**
     * @param:
     *  pid string (required),
     *  uid string (required),
     *  reason string (required)
     * @returns:
     *  "report successful"
     *      OR
     *  error message
     */
    var responseStatus, responseJson
    logger.logRequest(req)
    
    //confirm necessary params
    if(req.body.uid === undefined) {
        logger.logInvalidInput("uid is required")
        responseStatus = 400
        responseJson = {message: "uid is required"}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }
    if(req.body.pid === undefined) {
        logger.logInvalidInput("pid is required")
        responseStatus = 400
        responseJson = {message: "pid is required"}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }
    if(req.body.reason === undefined) {
        logger.logInvalidInput("reason is required")
        responseStatus = 400
        responseJson = {message: "reason is required"}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }

    //form query
    const query = {
        text: `INSERT INTO reports(uid, pid, reason) VALUES($1, $2, $3)`,
        values: Object.values([req.body.uid, req.body.pid, req.body.reason])
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
        responseJson = {message: "report created successfully"}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    })
}

module.exports = reports;