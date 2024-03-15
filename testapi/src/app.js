//imports
const express = require('express')
const bodyParser = require('body-parser')
const posts = require('./posts')
const users = require('./users')

//creates app
const app = express();

//enables app to parse JSON bodies
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({})); //allows parsing body from requests

//sends /posts to posts, /users to users
app.use('/posts', posts)
app.use('/users', users)

//exports app to server.js
module.exports = app;