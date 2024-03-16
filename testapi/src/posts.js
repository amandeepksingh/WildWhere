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
posts.get('/selectUserByPostID', (req, res, next) => selectUserByPostID(req, res, next))
posts.post('/createPost', (req, res, next) => createPost(req, res, next))
posts.put('/updatePost', (req, res, next) => updatePost(req, res, next))
posts.delete('/deletePost', (req, res, next) => deletePostByID(req, res, next))
posts.get('/selectUserByUserID', (req, res, next) => selectUserByUserID(req, res, next))

function selectUserByPostID(req, res, next) {
    //TODO
}

function createPost(req, res, next) {
    //TODO
}

function updatePost(req, res, next) {
    //TODO
}

function deletePostByID(req, res, next) {
    //TODO
}

function selectUserByUserID(req, res, next) {
    //TODO
    //Note that this one may be complicated since it will involve a JOIN
}

//exports posts to app
module.exports = posts;
