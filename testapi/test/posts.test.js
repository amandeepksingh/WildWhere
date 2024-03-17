const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const Pool = require('pg').Pool;
const app = require('../src/app');
require('dotenv').config();

//run tests with "npm test"

const pool = new Pool({
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
	// ssl: {
	// 	rejectUnauthorized:process.env.rejectUnauthorized
	// } //used only on EC2
});
async function teardown() { //TODO before each run. Using before() or after() seems to cause async issues
    await pool.query("DELETE FROM users")
    await pool.query("DELETE FROM posts")
}

describe("selecting posts", () => {
    //TODO
    //Note that this may be complicated due to coordinates.
    //May need another function to select posts that are within a certain coordinate circle
})

describe("creating posts", () => {
    //TODO
})

describe("updating posts", () => {
    //TODO
})

describe("deleting posts", () => {
    //TODO
})