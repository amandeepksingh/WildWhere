const request = require('supertest');
const mocha = require('mocha')
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
before(async () => {  
    await pool.query("DELETE FROM users")
    await pool.query("DELETE FROM posts")
})

describe("selecting posts by post id", () => {
    it("", () => {
        //TODO
    })
    it("", () => {
        //TODO
    })
    it("", () => {
        //TODO
    })
})

describe("creating posts", () => {
    it("", () => {
        //TODO
    })
    it("", () => {
        //TODO
    })
    it("", () => {
        //TODO
    })
})

describe("updating posts", () => {
    it("", () => {
        //TODO
    })
    it("", () => {
        //TODO
    })
    it("", () => {
        //TODO
    })
})

describe("deleting posts", () => {
    it("", () => {
        //TODO
    })
    it("", () => {
        //TODO
    })
    it("", () => {
        //TODO
    })
})

describe("selecting posts by user id", () => {
    it("", () => {
        //TODO
    })
    it("", () => {
        //TODO
    })
    it("", () => {
        //TODO
    })
})