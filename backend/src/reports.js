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
reports.post('/postReport', (req, res, next) => createReport(req, res, next));

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
    //TODO
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
    //TODO
}

module.exports = reports;