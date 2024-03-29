//imports
const express = require('express')
const bodyParser = require('body-parser')
const posts = require('./posts')
const users = require('./users')
const images = require('./images')
const getHelpTxt = require('./help');

//creates app
const app = express();

app.use(bodyParser.urlencoded({extended: true})); //enables app to parse urlencoded
app.use(bodyParser.json({})); //enables app to parse JSON bodies

//sends /posts to posts, /users to users
app.use('/posts', posts)
app.use('/users', users)
app.use('/images', images)
app.use(async (req,res) => res.status(404).json({"message": await getHelpTxt()}))

//exports app to server.js
module.exports = app;