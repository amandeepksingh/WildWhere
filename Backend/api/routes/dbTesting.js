const bodyParser = require('body-parser');
const express = require('express');

const Pool = require('pg').Pool;
const pool = new Pool({
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
});

const dbTesting = express();
dbTesting.get('/', (req, res, next) => {
    const query = req.body.query
    pool.query(query, (error, results) => {
        if (error) {
            return res.status(400).json({
                "message": error
            })
        }
        res.status(200).json({
            queryResp: results.rows
        })
    }); 
});

module.exports = dbTesting;