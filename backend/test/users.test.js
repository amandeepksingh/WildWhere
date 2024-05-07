const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const Pool = require('pg').Pool;
const app = require('../src/app');
const logger = require('../src/logger');
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
}


describe("selecting users", () => {
    it("USER: test select with empty", async () => {
        await teardown()
        const resp = await request(app).get(`/users/selectUser?uid=1`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [])
    })

    it("USER: test select with no matching criteria", async () => {
        await teardown()
        const uid = 'userID'
        await request(app).post('/users/createUser').send(`uid=${uid}`).send('email=jj@umass')

        const resp = await request(app)
        .get(`/users/selectUser?uid=${uid}&email=Notjj@umass`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [])
    })
    
    it("USER: test select with some constraints", async () => {
        await teardown()
        const uid = 'userID'
        await request(app).post('/users/createUser').send(`uid=${uid}`).send('email=jj@umass')
        await request(app).post('/users/createUser').send(`uid=user2`).send('email=notjj@umass')

        const resp = await request(app)
        .get(`/users/selectUser?uid=${uid}&email=jj@umass`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "uid": uid,
                "email": 'jj@umass',
                "username": null,
                "bio": null,
                "imglink": null,
                "superuser": null,
                "locationperm": null,
                "notificationperm": null,
                "colorblindrating": null
            }
        ])
    })

    it("USER: test select with ALL constraints", async () => {
        await teardown()
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
    })

    it("USER: test select with many users", async () => {
        await teardown()
        const uid1 = 'user1'
        await request(app).post('/users/createUser').send(`uid=${uid1}`).send('email=jj@umass')
        const uid2 = 'user2'
        await request(app).post('/users/createUser').send(`uid=${uid2}`).send('email=jj@umass')
        const uid3 = 'user3'
        await request(app).post('/users/createUser').send(`uid=${uid3}`).send('email=notjj@umass')

        const resp = await request(app).get(`/users/selectUser?email=jj@umass`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "uid": uid1,
                "email": "jj@umass",
                "username": null,
                "bio": null,
                "imglink": null,
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
                "imglink": null,
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
        const uid = 'testUID'
        const resp = await request(app).post('/users/createUser').send(`uid=${uid}`)
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, `user created`)
        assert.strictEqual(resp.body.uid, uid)
    })

    it("USER: test create without uid", async () => {
        await teardown()
        const resp = await request(app).post('/users/createUser')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `uid is required`)
    })

    it("USER: test create with all params", async () => {
        await teardown()
        testInput = {
            uid: '345',
            email: 'jj@umass.edu',
            username: 'jamesbarr',
            bio: 'bio',
            imglink: 'just a link rn',
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
        .send(`imglink=${testInput.imglink}`)
        .send(`superUser=${testInput.superUser}`)
        .send(`locationPerm=${testInput.locationPerm}`)
        .send(`notificationPerm=${testInput.notificationPerm}`)
        .send(`colorBlindRating=${testInput.colorBlindRating}`)
        assert.strictEqual(resp.body.message, `user created`)
        assert.strictEqual(resp.status, 200)

        const resp2 = await request(app).get(`/users/selectUser?uid=${testInput.uid}&email=${testInput.email}&username=${testInput.username}&bio=${testInput.bio}&superuser=${testInput.superUser}&locationperm=${testInput.locationPerm}&notificationperm=${testInput.notificationPerm}&colorblindrating=${testInput.colorBlindRating}`)
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [{
            uid: '345',
            email: 'jj@umass.edu',
            username: 'jamesbarr',
            bio: 'bio',
            imglink: 'just a link rn',
            superuser: false,
            locationperm: false,
            notificationperm: true,
            colorblindrating: 2
        }]) 
    })

    it("USER: test create with camel case qualifiers", async () => {
        await teardown()
        testInput = {
            uid: '345',
            colorBlindRating: 2
        }
        const resp = await request(app)
        .post('/users/createUser').send(`uid=${testInput.uid}`).send(`colorBlindRating=${testInput.colorBlindRating}`)
        assert.strictEqual(resp.body.message, `user created`)
        assert.strictEqual(resp.status, 200)

        const resp2 = await request(app).get(`/users/selectUser?uid=${testInput.uid}&colorblindrating=${testInput.colorBlindRating}`)
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [{
            uid: '345',
            email: null,
            username: null,
            bio: null,
            imglink: null,
            superuser: null,
            locationperm: null,
            notificationperm: null,
            colorblindrating: 2
        }]) 
    })

    it("USER: test create with lower case qualifiers", async () => {
        await teardown()
        testInput = {
            uid: '345',
            colorBlindRating: 2
        }
        const resp = await request(app)
        .post('/users/createUser').send(`uid=${testInput.uid}`).send(`colorblindrating=${testInput.colorBlindRating}`)
        assert.strictEqual(resp.body.message, `user created`)
        assert.strictEqual(resp.status, 200)

        const resp2 = await request(app).get(`/users/selectUser?uid=${testInput.uid}&colorblindrating=${testInput.colorBlindRating}`)
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [{
            uid: '345',
            email: null,
            username: null,
            bio: null,
            imglink: null,
            superuser: null,
            locationperm: null,
            notificationperm: null,
            colorblindrating: 2
        }]) 
    })

    it("USER: test create with some but not all params", async () => {
        await teardown()
        testInput = {
            email: 'jj@umass.edu',
            username: 'jamesbarr',
            imglink: 'just a link rn',
            notificationPerm: true,
            colorBlindRating: 2
        }
        const resp = await request(app)
        .post('/users/createUser')
        .send('uid=ffd             ')
        .send(`email=${testInput.email}`)
        .send(`username=${testInput.username}`)
        .send(`imglink=${testInput.imglink}`)
        .send(`notificationPerm=${testInput.notificationPerm}`)
        .send(`colorBlindRating=${testInput.colorBlindRating}`)
        assert.strictEqual(resp.body.message, `user created`)
        assert.strictEqual(resp.status, 200)
    })

    it("USER: test select with imagelink on multiple users", async () => {
        await teardown()
        const uid1 = "testUID1"
        await request(app).post('/users/createUser').send(`uid=${uid1}`)
        await request(app).post('/images/userProfilePic/upload').field('uid', uid1).attach('img', 'test/testImages/test1.jpg')
        const uid2 = "testUID2"
        await request(app).post('/users/createUser').send(`uid=${uid2}`)
        await request(app).post('/images/userProfilePic/upload').field('uid', uid2).attach('img', 'test/testImages/test1.jpg')
        const resp = await request(app).get(`/users/selectUser`)
        assert.strictEqual(resp.status, 200)
        assert.ok(resp.body.message[0].imglink.includes('http'))
        assert.ok(resp.body.message[1].imglink.includes('http'))
    })
})

describe("updating users", () => {
    it("USER: update user with email", async () => {
        await teardown()
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const email = "jj@umass.edu"
        const resp1 = await request(app).put('/users/updateUserByUID').send(`uid=${uid}`).send(`email=${email}`)
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `user with uid ${uid} updated`)

        const resp2 = await request(app).get(`/users/selectUser?uid=${uid}`)
        assert.deepStrictEqual(resp2.body.message, 
            [
                {
                    "uid": uid,
                    "email": email,
                    "username": null,
                    "bio": null,
                    "imglink": null,
                    "superuser": null,
                    "locationperm": null,
                    "notificationperm": null,
                    "colorblindrating": null
                }
            ]
        ) 
    })

    it("USER: update user, set field to empty string", async () => {
        await teardown()
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const email = ""
        const resp1 = await request(app).put('/users/updateUserByUID').send(`uid=${uid}`).send(`email=${email}`)
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `user with uid ${uid} updated`)

        const resp2 = await request(app).get(`/users/selectUser?uid=${uid}`)
        assert.deepStrictEqual(resp2.body.message, 
            [
                {
                    "uid": uid,
                    "email": "",
                    "username": null,
                    "bio": null,
                    "imglink": null,
                    "superuser": null,
                    "locationperm": null,
                    "notificationperm": null,
                    "colorblindrating": null
                }
            ]
        ) 
    })

    it("USER: update user, update all fields", async () => {
        await teardown()
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp1 = await request(app).put('/users/updateUserByUID').send(`uid=${uid}`).send('email=a').send('username=b').send('bio=c')
            .send('imglink=d').send('superuser=true').send('locationPerm=true').send('notificationPerm=true').send('colorblindrating=10')
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `user with uid ${uid} updated`)

        const resp2 = await request(app).get(`/users/selectUser?uid=${uid}`)
        assert.deepStrictEqual(resp2.body.message, 
            [
                {
                    "uid": uid,
                    "email": "a",
                    "username": "b",
                    "bio": "c",
                    "imglink": "d",
                    "superuser": true,
                    "locationperm": true,
                    "notificationperm": true,
                    "colorblindrating": 10
                }
            ]
        ) 
    })

    it("USER: update user, update with camelcase", async () => {
        await teardown()
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp1 = await request(app).put('/users/updateUserByUID').send(`uid=${uid}`).send('notificationPerm=true')
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `user with uid ${uid} updated`)

        const resp2 = await request(app).get(`/users/selectUser?uid=${uid}`)
        assert.deepStrictEqual(resp2.body.message, 
            [
                {
                    "uid": uid,
                    "email": null,
                    "username": null,
                    "bio": null,
                    "imglink": null,
                    "superuser": null,
                    "locationperm": null,
                    "notificationperm": true,
                    "colorblindrating": null
                }
            ]
        ) 
    })

    it("USER: update user, update with lowercase", async () => {
        await teardown()
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp1 = await request(app).put('/users/updateUserByUID').send(`uid=${uid}`).send('notificationperm=true')
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `user with uid ${uid} updated`)

        const resp2 = await request(app).get(`/users/selectUser?uid=${uid}`)
        assert.deepStrictEqual(resp2.body.message, 
            [
                {
                    "uid": uid,
                    "email": null,
                    "username": null,
                    "bio": null,
                    "imglink": null,
                    "superuser": null,
                    "locationperm": null,
                    "notificationperm": true,
                    "colorblindrating": null
                }
            ]
        ) 
    })

    it("USER: update user without updates", async () => {
        await teardown()
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp = await request(app).put('/users/updateUserByUID').send(`uid=${uid}`)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `at least one update is required`)
    })

    it("USER: update user without uid", async () => {
        await teardown()
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp = await request(app).put('/users/updateUserByUID')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `uid is required`)
    })
})

describe("deleting users", () => {
    it("USER: delete user by ID", async () => {
        await teardown()
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `user with uid ${uid} deleted if existed`)

        const resp2 = await request(app).get(`/users/selectUser?uid=${uid}`)
        assert.deepStrictEqual(resp2.body.message, [])
    }) 

    it("USER: delete user by ID where ID not listed", async () => {
        await teardown()
        const uid = 'testUID'
        const resp = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, `user with uid ${uid} deleted if existed`)
    }) 
    it("USER: delete user by ID without uid", async () => {
        await teardown()
        const resp = await request(app).delete('/users/deleteUserByUID')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `uid is required`)
    }) 
})