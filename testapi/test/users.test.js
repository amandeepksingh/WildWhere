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


describe("selecting users by id", () => {
    /*
    tests:
        Endpoint: /users/selectUserByID
        Method: GET
        Params:
            uid int (required)
    */
    it("test select without uid", (done) => {
        request(app)
        .get('/users/selectUserByID') //specify endpoint
        .expect('Content-Type', /json/) //needs to be json
        .expect(400, {
            message: "missing uid field" 
        }) //this is the status and response json
        .end(function(err,res) {
            done(err) //fails if err is defined
        })
    })
    it("test select with unlisted id", (done) => {
        request(app)
        .get('/users/selectUserByID')
        .send('uid=1') //send body parameters
        .expect('Content-Type', /json/)
        .expect(200, {
            message: [] 
        })
        .end(function(err,res) {
            done(err)
        })
    })
})

describe("creating users", () => {
    /*
    tests:
        Endpoint: /users/createrUser
        Method: POST
        Parms:
            uid int (required)
            email string (optional)
            username string (optional)
            bio string (optional)
            pfplink linkToImg (optional)
            superUser boolean (optional)
            locationPerms boolean (optional)
            notificationPerms boolean (optional)
            colorblindrating boolean (optional)
    */
   it("test create without uid", (done) => {
        request(app)
        .post('/users/createUser')
        .expect('Content-Type', /json/)
        .expect(400, {
            message: "missing uid"
        })
        .end(function(err,res) {
            done(err)
        })
   })
   it("test create with only uid", (done) => {
        testInput = {
            uid: 4
        }
        request(app)
        .post('/users/createUser')
        .send(`uid=${testInput.uid}`)
        .expect(200, {
            message: `user with uid ${testInput.uid} created`
        })
        .end(function(err,res) {
            done(err)
        })
   })
   it("test create with all params", (done) => {
        testInput = {
            uid: 5, //note that there is a little overlap between tests even with the before functioning clearing it all out.
            email: 'jj@umass.edu',
            username: 'jamesbarr',
            bio: 'bio',
            pfpLink: 'just a link rn',
            superUser: false,
            locationPerm: false,
            notificationPerm: true,
            colorBlindRating: 2
        }
        request(app)
        .post('/users/createUser')
        .send(`uid=${testInput.uid}`)
        .send(`email=${testInput.email}`)
        .send(`username=${testInput.username}`)
        .send(`bio=${testInput.bio}`)
        .send(`pfpLink=${testInput.pfpLink}`)
        .send(`superUser=${testInput.superUser}`)
        .send(`locationPerm=${testInput.locationPerm}`)
        .send(`notificationPerm=${testInput.notificationPerm}`)
        .send(`colorBlindRating=${testInput.colorBlindRating}`)
        .expect(200, {
            message: `user with uid ${testInput.uid} created`
        })
        .end(function(err,res) {
            done(err)
        })
   })
   it("test create with some but not all params", (done) => {
    testInput = {
        uid: 6, //note that there is a little overlap between tests even with the before functioning clearing it all out.
        email: 'jj@umass.edu',
        username: 'jamesbarr',
        pfpLink: 'just a link rn',
        notificationPerm: true,
        colorBlindRating: 2
    }
    request(app)
    .post('/users/createUser')
    .send(`uid=${testInput.uid}`)
    .send(`email=${testInput.email}`)
    .send(`username=${testInput.username}`)
    .send(`pfpLink=${testInput.pfpLink}`)
    .send(`notificationPerm=${testInput.notificationPerm}`)
    .send(`colorBlindRating=${testInput.colorBlindRating}`)
    .expect(200, {
        message: `user with uid ${testInput.uid} created`
    })
    .end(function(err,res) {
        done(err)
    })
   })
})

describe("updating users", () => {
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

describe("deleting users", () => {
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