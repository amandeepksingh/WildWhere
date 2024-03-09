const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const router = require('./router');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({}));
app.use("/", router);

module.exports = app;