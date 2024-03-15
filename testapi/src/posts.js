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
	// }
});

//creates posts and routes methods and endpoints to functions
const posts = express();
posts.get('/selectPost', (req, res, next) => selectPost(req, res, next))






function selectPost(req, res, next) {
    /*
    takes in a req with a 'query' string in the body
    runs the 'query' string in the DB
    returns the result of the 'query'
    */
    if (req.body === undefined || req.body.query === undefined) {
        return res.status(400).json({
            "message": "missing query field"
        })
    }
    query = req.body.query
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

//exports posts to app
module.exports = posts;
