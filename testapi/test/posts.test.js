const request = require('supertest');
const mocha = require('mocha')
const { describe } = require('node:test');

const app = require('../src/app');

describe("selecting users by id", () => {
    /*
    tests:
        Endpoint: /users/selectUserByID
        Method: GET
        Params:
            id int
    */
    it("test select without id", (done) => {
        request(app)
        .get('/users/selectUserByID') //specify endpoint
        .expect('Content-Type', /json/) //needs to be json
        .expect(400, {
            message: "missing id field" 
        }) //this is the status and response json
        .end(function(err,res) {
            done(err) //fails if err is defined
        })
    })
    it("test select with unlisted id", (done) => {
        request(app)
        .get('/users/selectUserByID')
        .send('id=nameNotListed') //send body parameters
        .expect('Content-Type', /json/)
        .expect(200, {
            message: [] 
        })
        .end(function(err,res) {
            done(err)
        })
    })
})