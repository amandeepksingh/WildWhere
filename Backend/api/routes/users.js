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

const users = express();
users.post('/add', (req, res, next) => {
    const query = `INSERT INTO users(username, email, radius, notify, bio) VALUES('${req.body.username}',`
        + `'${req.body.email}', ${parseInt(req.body.radius)}, ${req.body.notify}, '${req.body.bio}');`
    console.log(query)
    pool.query(query, (error, result) => {
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

module.exports = users;