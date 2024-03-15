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



function selectUserByID(req, res, next) {
    /*
    takes in a req with a 'id' string
    runs the 'query' with the id in the DB
    returns the result
    */
    if (req.body.id === undefined) {
        return res.status(400).json({
            "message": "missing id field"
        })
    }
    query = `SELECT * FROM users WHERE id='${req.body.id}'`
    return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            })
        }
        return res.status(200).json({
            message: result.rows
        })
    })
}


//exports users to app
module.exports = users;