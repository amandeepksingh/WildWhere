const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const Pool = require('pg').Pool;
const app = require('../src/app');
require('dotenv').config();

//run tests with "npm test"

//creates DB connection
var poolParams = {
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
};
if(process.env.location !== "local") poolParams.ssl = {rejectUnauthorized: false}; //for server pool
const pool = new Pool(poolParams);

//teardown command
async function teardown() { //TODO before each run. Using before() or after() seems to cause async issues
    await pool.query("DELETE FROM users;")
    await pool.query("DELETE FROM posts;")
    await pool.query("DELETE FROM reports;")
}

describe("selecting reports", () => {
    //TODO
})

describe("creating reports", () => {
    //TODO
})