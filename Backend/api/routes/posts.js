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
posts.post('/', (req,res,next) => createPost(req,res,next));
posts.get('/', (req, res, next) => selectPost(req, res, next))
posts.put("/", (req, res, next) => updatePost(req, res, next))
posts.delete("/", (req, res, next) => deletePost(req, res, next))

function createPost(req, res, next) {
    const author = req.body.author || null;
    const species = req.body.species || null;
    const quantity = parseInt(req.body.quantity) || null;
    const comments = req.body.comments || null;
    const dt = req.body.dt || null;
    var coordinates = null;
    if (req.body.coordinates) {
        coordinates = `point(${req.body.coordinates[0]},${req.body.coordinates[1]})`
    }

    const query = `INSERT INTO posts(author, species, quantity, comments, dt, coordinates)`
        + ` VALUES('${author}', '${species}', ${quantity}, '${comments}', '${dt}', ${coordinates});`
    
    pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error
            })
        }
        return res.status(200).json({
            respQuery: "Post by " + req.body.author + " successfully added"
        })
    });
}

function selectPost(req, res, next) {
    var query = "SELECT * FROM posts"
    
    if (req.body.condition) {
        query += " WHERE " + req.body.condition;
    }
    if (req.body.limit) {
        query += " LIMIT " + parseInt(req.body.limit);
    }

    pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error
            })
        }
        return res.status(200).json({
            respQuery: result
        })
    })
}

function updatePost(req, res, next) {
    if (req.body.updates === undefined) {
        return res.status(200).json({
            respQuery: "no updates to be made"
        })
    }

    pairs = ""
    for (let i = 0; i < req.body.updates.length; i++) {
        pairs += req.body.updates[i][0] + " = " + req.body.updates[i][1] + ", "
    }
    var query = "UPDATE posts SET " + pairs.slice(0,-2);

    if (req.body.condition) {
        query += " WHERE " + req.body.condition;
    }

    pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error
            })
        }
        return res.status(200).json({
            respQuery: result
        })
    })
}

function deletePost(req, res, next) {
    var query = "DELETE FROM posts";

    if (req.body.condition) {
        query += " WHERE " + req.body.condition;
    }

    pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error
            })
        }
        return res.status(200).json({
            respQuery: result
        })
    })

}

module.exports = posts;