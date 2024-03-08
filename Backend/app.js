const express = require('express');
const env = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const router = require('./api/router');

// const pg = require('pg'); //TODO look into pools
// const client = new pg.Client({
//     user: "wildwhere", //env.dbUser,
//     host: "localhost", //env.dbHost,
//     database: "wildwhere", //env.dbName,
//     password: "CS320ROCKS!!", //env.dbPass,
//     port: "5432"//env.dbPort,
// });

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({}));
app.use("/", router);

module.exports = app;