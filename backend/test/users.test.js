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
    await pool.query("DELETE FROM users;")
    await pool.query("DELETE FROM posts;")
}


describe("selecting users", () => {
    it("USER: test select with empty", async () => {
        await teardown()
        const resp = await request(app)
        .get('/users/selectUser')
        .send('uid=1') //send body parameters
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [])
    })
    it("USER: test select with too strict constraints", async () => {
        await teardown()
        const resp1 = await request(app)
        .post('/users/createUser')
        .send('email=jj@umass')
        const uid = resp1.body.uid

        const resp2 = await request(app)
        .get('/users/selectUser')
        .send(`uid=${uid}`) //send body parameters
        .send('email=jj@umas') //send body parameters
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [])
    })
    it("USER: test select with few constraints", async () => {
        await teardown()
        const resp1 = await request(app)
        .post('/users/createUser')
        .send('email=jj@umass')
        assert.deepStrictEqual(resp1.body.message, `user created`)
        const uid = resp1.body.uid

        const resp2 = await request(app)
        .get('/users/selectUser')
        .send(`uid=${uid}`) //send body parameters
        .send('email=jj@umass') //send body parameters
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [
            {
                "uid": uid,
                "email": 'jj@umass',
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
    it("USER: test select with ALL constraints", async () => {
        await teardown()
        const resp1 = await request(app)
        .post('/users/createUser')
        .send('uid=345')
        .send('email=jj@umass')
        .send('username=John')
        .send('bio=Student')
        .send('pfpLink=test_link')
        .send('superUser=1')
        .send('locationPerm=1')
        .send('notificationPerm=1')
        .send('colorBlindRating=10')

        const resp2 = await request(app)
        .get('/users/selectUser')
        .send(`uid=345`) //send body parameters
        .send('email=jj@umass') //send body parameters
        .send('username=John')
        .send('bio=Student')
        .send('pfpLink=test_link')
        .send('superUser=1')
        .send('locationPerm=1')
        .send('notificationPerm=1')
        .send('colorBlindRating=10')
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [
            {
                "uid": "345",
                "email": "jj@umass",
                "username": "John",
                "bio": "Student",
                "pfplink": "test_link",
                "superuser": true,
                "locationperm": true,
                "notificationperm": true,
                "colorblindrating": 10
            }
        ])
    })
    it("USER: test select with many users", async () => {
        await teardown()
        const resp1 = await request(app)
        .post('/users/createUser')
        .send('email=jj@umass')
        const uid1 = resp1.body.uid

        const resp1b = await request(app)
        .post('/users/createUser')
        .send('email=jj@umass')
        const uid2 = resp1b.body.uid

        const resp1c = await request(app)
        .post('/users/createUser')
        .send('email=aj@umass')

        const resp2 = await request(app)
        .get('/users/selectUser')
        .send('email=jj@umass')
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [
            {
                "uid": uid1,
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
                "uid": uid2,
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
   it("USER: test create", async () => {
        await teardown()
        const resp = await request(app)
        .post('/users/createUser')
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, `user created`)
   })
   it("USER: test create with all params", async () => {
        await teardown()
        testInput = {
            uid: '345',
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
        assert.strictEqual(resp.body.message, `user created`)
        assert.strictEqual(resp.status, 200)
   })
   it("USER: test create with some but not all params", async () => {
    await teardown()
    testInput = {
        email: 'jj@umass.edu',
        username: 'jamesbarr',
        pfpLink: 'just a link rn',
        notificationPerm: true,
        colorBlindRating: 2
    }
    const resp = await request(app)
    .post('/users/createUser')
    .send(`email=${testInput.email}`)
    .send(`username=${testInput.username}`)
    .send(`pfpLink=${testInput.pfpLink}`)
    .send(`notificationPerm=${testInput.notificationPerm}`)
    .send(`colorBlindRating=${testInput.colorBlindRating}`)
    assert.strictEqual(resp.body.message, `user created`)
    assert.strictEqual(resp.status, 200)
   })
})

describe("updating users", () => {
    it("USER: update user with email", async () => {
        await teardown()
        const email = "jj@umass.edu"
        const resp1 = await request(app)
        .post('/users/createUser')
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `user created`)
        const uid = resp1.body.uid
        
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
    it("USER: delete user by ID", async () => {
        await teardown()
        const resp1 = await request(app)
        .post('/users/createUser')
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `user created`)
        const uid = resp1.body.uid

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
    it("USER: delete user by ID where ID not listed", async () => {
        await teardown()
        const resp2 = await request(app)
        .delete('/users/deleteUserByUID')
        .send(`uid=5`)
        assert.strictEqual(resp2.status, 200)
        assert.strictEqual(resp2.body.message, `user with uid 5 deleted if existed`)
    }) 
})