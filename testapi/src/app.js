const express = require('express')
require('dotenv').config();

const Pool = require('pg').Pool;
const pool = new Pool({
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
	// ssl: {
	// 	rejectUnauthorized:process.env.rejectUnauthorized
	// }
});

const app = express();
app.get('/app', (req, res, next) => selectPost(req, res, next))

function selectPost(req, res, next) {
    var query = "SELECT * FROM users"
	console.log(process.env.dbUser);
    return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            })
        }
        return res.status(200).json({
            respQuery: result.rows
        })
    })
}

module.exports = app;
