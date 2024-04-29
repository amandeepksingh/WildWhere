const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const http = require('http');

// server endpoint
const app = 'http://ec2-3-23-98-233.us-east-2.compute.amazonaws.com'

describe("sanity check", () => {
    it("check math", async () => {
      assert.strictEqual(1,1);
    });

    it("server ping", async () => {
      const res = await request(app)
      .get(`/users/selectUser?uid=1`);
       assert.strictEqual(res.status, 200);
   });
    
   it("posts ping", async () => {
    const res = await request(app)
    .get(`/users/selectUser?uid=1`);
     assert.strictEqual(res.status, 300);
 });

});

describe("select users and posts", () => {
  it("USER: test select with ALL constraints", async () => {
    await request(app).post('/users/createUser').send(`uid=randomUID1`).send('email=jj@umass').send('username=John').send('bio=Student')
        .send('superUser=true').send('locationPerm=true').send('notificationPerm=true').send('colorBlindRating=10')
    await request(app).post('/users/createUser').send(`uid=randomUID2`).send('email=jj@umass').send('username=John').send('bio=Student')
        .send('superUser=true').send('locationPerm=true').send('notificationPerm=true')
    await request(app).post('/users/createUser').send(`uid=randomUID3`).send('email=jj@umass').send('username=John').send('bio=Student')
        .send('superUser=true').send('locationPerm=true').send('colorBlindRating=10')
    await request(app).post('/users/createUser').send(`uid=randomUID4`).send('email=jj@umass').send('username=John').send('bio=Student')
        .send('superUser=true').send('notificationPerm=true').send('colorBlindRating=10')
    await request(app).post('/users/createUser').send(`uid=randomUID5`).send('email=jj@umass').send('username=John').send('bio=Student')
        .send('locationPerm=true').send('notificationPerm=true').send('colorBlindRating=10')
    await request(app).post('/users/createUser').send(`uid=randomUID6`).send('email=jj@umass').send('username=John')
        .send('superUser=true').send('locationPerm=true').send('notificationPerm=true').send('colorBlindRating=10')    
    await request(app).post('/users/createUser').send(`uid=randomUID7`).send('email=jj@umass').send('bio=Student')
        .send('superUser=true').send('locationPerm=true').send('notificationPerm=true').send('colorBlindRating=10')
    await request(app).post('/users/createUser').send('email=jj@umass').send('username=John').send('bio=Student')
        .send('superUser=true').send('locationPerm=true').send('notificationPerm=true').send('colorBlindRating=10')

    const resp2 = await request(app).get(`/users/selectUser?uid=randomUID1&email=jj@umass&username=John&bio=Student&superUser=true&locationPerm=true&notificationPerm=true&colorBlindRating=10`)
    assert.strictEqual(resp2.status,200)
    assert.deepStrictEqual(resp2.body.message, [
        {
            "uid": "randomUID1",
            "email": "jj@umass",
            "username": "John",
            "bio": "Student",
            "imglink": null,
            "superuser": true,
            "locationperm": true,
            "notificationperm": true,
            "colorblindrating": 10
        }
    ])
  });
});

