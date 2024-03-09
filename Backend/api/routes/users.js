const express = require('express')

const Pool = require('pg').Pool;
const pool = new Pool({
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
});

const users = express();
users.post('/', (req, res, next) => {
    const username = req.body.username || null;
    const email = req.body.email || null;
    const radius = parseInt(req.body.radius) || null;
    const notify = req.body.notify || null;
    const bio = req.body.bio || null;

    const query = `INSERT INTO users(username, email, radius, notify, bio)`
        + ` VALUES('${username}', '${email}', ${radius}, ${notify}, '${bio}');`
    
    pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error
            })
        }
        res.status(200).json({
            respQuery: "User " + req.body.username + " successfully added"
        })
    });
});

users.get('/', (req, res, next) => {
    var query = "SELECT * FROM users"
    
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
        res.status(200).json({
            respQuery: result
        })
    })
})

users.put("/", (req, res, next) => {
    if (req.body.updates === undefined) {
        return res.status(200).json({
            respQuery: "no updates to be made"
        })
    }

    pairs = ""
    for (let i = 0; i < req.body.updates.length; i++) {
        pairs += req.body.updates[i][0] + " = " + req.body.updates[i][1] + ", "
    }
    var query = "UPDATE users SET " + pairs.slice(0,-2);

    if (req.body.condition) {
        query += " WHERE " + req.body.condition;
    }
    
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
    })
})

users.delete("/", (req, res, next) => {
    var query = "DELETE FROM users";

    if (req.body.condition) {
        query += " WHERE " + req.body.condition;
    }
    
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
    })

})


module.exports = users;