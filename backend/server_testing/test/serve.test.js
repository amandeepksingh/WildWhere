const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const http = require('http');

// server endpoint
const endpoint = 'http://ec2-3-23-98-233.us-east-2.compute.amazonaws.com'

describe("selecting users", () => {
    it("sanity check", async () => {
      assert.strictEqual(1,1);
    });

    it("server ping", async () => {
      const res = await request('http://ec2-3-23-98-233.us-east-2.compute.amazonaws.com')
      .get(`/users/selectUser?uid=1`);
       assert.strictEqual(res.status, 200);
   });
    

});

