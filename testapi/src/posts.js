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
/*
    @params:
        pid int (optional),
        uid int (optional),
        radius int (optional),
        imgLink string (optional),
        datetime string (optional),
        coordinate [float,float] (optional)
    @returns:
        message []{
            pid int,
            uid int,
            radius int,
            imgLink string,
            datetime string,
            coordinate [float,float]
        }
*/
posts.post('/createPost', (req, res, next) => createPost(req, res, next))
/*
    @params:
        pid int (required),
        uid int (required),
        radius int (optional),
        imgLink string (optional),
        datetime string (optional),
        coordinate [float,float] (optional)
    @returns:
        message string
            `post with pid ${testInput.pid} created`
            error message
*/
posts.put('/updatePostByPID', (req, res, next) => updatePostByPID(req, res, next))
/*
    @params:
        pid int (required),
        uid int (optional),
        radius int (optional),
        imgLink string (optional),
        datetime string (optional),
        coordinate [float,float] (optional)
    @returns:
        message string
            `post with pid ${testInput.pid} updated`
            error message
*/
posts.delete('/deletePostByPID', (req, res, next) => deletePostByPID(req, res, next))
/*
    @params:
        pid int (required)
    @returns:
        message string:
            `post with pid ${pid} deleted if existed`
            error message
*/

function selectPost(req, res, next) {
    //TODO
}

function createPost(req, res, next) {
    //TODO
}

function updatePostByPID(req, res, next) {
    //TODO
}

function deletePostByPID(req, res, next) {
    //TODO
}

//exports posts to app
module.exports = posts;
