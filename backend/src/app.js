//imports
const express = require('express')
const bodyParser = require('body-parser')
const posts = require('./posts')
const users = require('./users')
const images = require('./images')
// const reports = require('./reports')
const getHelpTxt = require('./help');
const morgan = require('morgan');
const logger = require('./logger');

//creates app
const app = express();

//setup logger and integrate as middleware
new logger();
morgan.token('date', function() {
    var p = new Date().toString().replace(/[A-Z]{3}\+/,'+').split(/ /);
    return( p[2]+'/'+p[1]+'/'+p[3]+':'+p[4]+' '+p[5] );
});
app.use(morgan(':remote-addr - :remote-user [:date[clf]] :method :url HTTP/:http-version :status :res[content-length] :referrer :user-agent', { stream: logger.requestLogStream }));

//enables app to parse urlencoded and JSON bodies
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({})); //allows parsing body from requests

//sends /posts to posts, /users to users, /images to images, and displays help method to remaining
app.use('/posts', posts)
app.use('/users', users)
app.use('/images', images)
// app.use('/reports', reports)
app.use(async (req, res) => res.status(404).json({"message": await getHelpTxt(req.originalUrl, req.body, req.rawHeaders)}))

//exports app to server.js
module.exports = app;