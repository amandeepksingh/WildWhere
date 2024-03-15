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

//exports posts to app
module.exports = posts;
