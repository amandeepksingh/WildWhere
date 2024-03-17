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


describe("selecting users", () => {
    it("test select with empty", async () => {
        teardown()
        const resp = await request(app)
        .get('/users/selectUser')
        .send('uid=1') //send body parameters
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [])
    })
    it("test select with too strict constraints", async () => {
        teardown()
        const resp1 = await request(app)
        .post('/users/createUser')
        .send('uid=1')
        .send('email=jj@umass')
        const resp2 = await request(app)
        .get('/users/selectUser')
        .send('uid=1') //send body parameters
        .send('email=jj@umas') //send body parameters
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [])
    })
    it("test select with many constraints", async () => {
        teardown()
        const resp1 = await request(app)
        .post('/users/createUser')
        .send('uid=1')
        .send('email=jj@umass')
        const resp2 = await request(app)
        .get('/users/selectUser')
        .send('uid=1') //send body parameters
        .send('email=jj@umass') //send body parameters
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [
            {
                "uid": 1,
                "email": "jj@umass",
                "username": null,
                "bio": null,
                "pfplink": null,
                "superuser": null,
                "locationperm": null,
                "notificationperm": null,
                "colorblindrating": null
            }
        ])
    })
    it("test select with few constraints", async () => {
        teardown()
        const resp1 = await request(app)
        .post('/users/createUser')
        .send('uid=1')
        .send('email=jj@umass')
        const resp2 = await request(app)
        .get('/users/selectUser')
        .send('uid=1') //send body parameters
        .send('email=jj@umass') //send body parameters
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [
            {
                "uid": 1,
                "email": "jj@umass",
                "username": null,
                "bio": null,
                "pfplink": null,
                "superuser": null,
                "locationperm": null,
                "notificationperm": null,
                "colorblindrating": null
            }
        ])
    })
    it("test select with many users", async () => {
        teardown()
        const resp1 = await request(app)
        .post('/users/createUser')
        .send('uid=1')
        .send('email=jj@umass')
        const resp1b = await request(app)
        .post('/users/createUser')
        .send('uid=2')
        .send('email=jj@umass')
        const resp2 = await request(app)
        .get('/users/selectUser')
        .send('email=jj@umass')
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [
            {
                "uid": 1,
                "email": "jj@umass",
                "username": null,
                "bio": null,
                "pfplink": null,
                "superuser": null,
                "locationperm": null,
                "notificationperm": null,
                "colorblindrating": null
            },
            {
                "uid": 2,
                "email": "jj@umass",
                "username": null,
                "bio": null,
                "pfplink": null,
                "superuser": null,
                "locationperm": null,
                "notificationperm": null,
                "colorblindrating": null
            }
        ])
    })
})

describe("creating users", () => {
   it("test create without uid", async () => {
        teardown()
        const resp = await request(app)
        .post('/users/createUser')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "missing uid")
   })
   it("test create with only uid", async () => {
        teardown()
        testInput = {
            uid: 4
        }
        const resp = await request(app)
        .post('/users/createUser')
        .send(`uid=${testInput.uid}`)
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, `user with uid ${testInput.uid} created`)
   })
   it("test create with all params", async () => {
        teardown()
        testInput = {
            uid: 4, 
            email: 'jj@umass.edu',
            username: 'jamesbarr',
            bio: 'bio',
            pfpLink: 'just a link rn',
            superUser: false,
            locationPerm: false,
            notificationPerm: true,
            colorBlindRating: 2
        }
        const resp = await request(app)
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
        assert.strictEqual(resp.body.message, `user with uid ${testInput.uid} created`)
        assert.strictEqual(resp.status, 200)
   })
   it("test create with some but not all params", async () => {
    teardown()
    testInput = {
        uid: 4,
        email: 'jj@umass.edu',
        username: 'jamesbarr',
        pfpLink: 'just a link rn',
        notificationPerm: true,
        colorBlindRating: 2
    }
    const resp = await request(app)
    .post('/users/createUser')
    .send(`uid=${testInput.uid}`)
    .send(`email=${testInput.email}`)
    .send(`username=${testInput.username}`)
    .send(`pfpLink=${testInput.pfpLink}`)
    .send(`notificationPerm=${testInput.notificationPerm}`)
    .send(`colorBlindRating=${testInput.colorBlindRating}`)
    assert.strictEqual(resp.body.message, `user with uid ${testInput.uid} created`)
    assert.strictEqual(resp.status, 200)
   })
})

describe("updating users", () => {
    it("update user with email", async () => {
        teardown()
        const uid = 4,
            email = "jj@umass.edu"
        const resp1 = await request(app)
        .post('/users/createUser')
        .send(`uid=${uid}`)
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `user with uid ${uid} created`)
        
        const resp2 = await request(app)
        .put('/users/updateUserByUID')
        .send(`uid=${uid}`)
        .send(`email=${email}`)
        assert.strictEqual(resp2.status, 200)
        assert.strictEqual(resp2.body.message, `user with uid ${uid} updated`)

        const resp3 = await request(app)
        .get('/users/selectUser')
        .send(`uid=${uid}`)
        assert.strictEqual(resp3.status, 200)
        assert.deepStrictEqual(resp3.body.message, 
            [
                {
                    "uid": uid,
                    "email": email,
                    "username": null,
                    "bio": null,
                    "pfplink": null,
                    "superuser": null,
                    "locationperm": null,
                    "notificationperm": null,
                    "colorblindrating": null
                }
            ]
        ) 
    })
})

describe("deleting users", () => {
    it("delete user by ID", async () => {
        teardown()
        const uid = 4
        const resp1 = await request(app)
        .post('/users/createUser')
        .send(`uid=${uid}`)
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `user with uid ${uid} created`)

        const resp2 = await request(app)
        .delete('/users/deleteUserByUID')
        .send(`uid=${uid}`)
        assert.strictEqual(resp2.status, 200)
        assert.strictEqual(resp2.body.message, `user with uid ${uid} deleted if existed`)

        const resp3 = await request(app)
        .get('/users/selectUser')
        .send(`uid=${uid}`)
        assert.strictEqual(resp3.status, 200)
        assert.deepStrictEqual(resp3.body.message, [])
    }) 
    it("delete user by ID where ID not listed", async () => {
        teardown()
        const resp2 = await request(app)
        .delete('/users/deleteUserByUID')
        .send(`uid=5`)
        assert.strictEqual(resp2.status, 200)
        assert.strictEqual(resp2.body.message, `user with uid 5 deleted if existed`)
    }) 
})