const bodyParser = require('body-parser');
const express = require('express')

const env = require('dotenv').config();
const Pool = require('pg').Pool;
const pool = new Pool({
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
});

const posts = express();
posts.post('/add', (req, res, next) => {
    pool.query("...", [], (error, result) => {
            if (error) {
                return res.status(400).json({
                    "message": error
                })
            }
            res.status(200).json({
                respQuery: result
            })
    });
});

module.exports = posts;