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

// posts.post('/get') TODO
// posts.get('/get') TODO
// posts.put('/update') TODO
// posts.delete('/delete') TODO

module.exports = posts;