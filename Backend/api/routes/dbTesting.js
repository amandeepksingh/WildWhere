const bodyParser = require('body-parser');
const express = require('express');

const pg = require('pg'); //TODO look into pools
const client = new pg.Client({
    user: "wildwhere", //env.dbUser,
    host: "localhost", //env.dbHost,
    database: "wildwhere", //env.dbName,
    password: "CS320ROCKS!!", //env.dbPass,
    port: "5432"//env.dbPort,
});

const dbTesting = express();
dbTesting.get('/', async (req, res, next) => {
    const dbTesting = { query: req.body.query }
    try {
        await client.connect();
        const queryResp = client.query(dbTesting.query);
        await client.end();
    } catch (error) {
        return res.status(400).json({"error":error})
    }
    return res.status(200).json({
        queryResp: "not defined yet"
        // queryResp: queryResp
    })
});

module.exports = dbTesting;