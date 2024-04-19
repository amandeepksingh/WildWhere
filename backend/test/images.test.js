const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const app = require('../src/app');
const path = require('path')

const Pool = require('pg').Pool;
require('dotenv').config();

//TODO configure automatic teardown functionality

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
         //await pool.query("SELECT setval('posts_pid_seq', 1, true);")
         //await pool.query("SELECT setval('users_uid_seq', 1, true);")
     }
    

describe("IMAGES: test user image upload", () => {
    it("IMAGES: test user normal functionality", async () => {
        await teardown();

        //create user
        const resp1 = await request(app).post('/users/createUser')
            .send('uid=ffd')
        const uid = resp1.body.uid;
        
        //add img
        const resp2 = await request(app).post('/images/userProfilePic/upload')
            .field('uid', uid)
            .attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp2.status, 200)
        
        //check img in db
        const resp3 = await request(app).get(`/users/selectUser?uid=${uid}`)
        assert.strictEqual(resp3.body.message[0].imglink, resp2.body.message)

        //teardown
        await request(app).delete('/images/userProfilePic/delete')
            .field('uid', uid)
    });

    it("IMAGES: test user profile picture upload missing uid", async () => {
        const resp = await request(app).post('/images/userProfilePic/upload')
            .attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "uid is required")
    })

    it("IMAGES: test user upload missing img", async () => {
        const resp = await request(app).post('/images/userProfilePic/upload')
            .field('uid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "img must be specified")
    })

})

describe("IMAGES: test post image upload", () => {
    it("IMAGES: test post normal functionality", async () => {
        await teardown();

        //create user
        const resp1 = await request(app).post('/users/createUser')
            .send('uid=ffd')
        const uid = resp1.body.uid;
        const resp1b = await request(app).post('/posts/createPost')
            .send('pid=ffd')
            .send(`uid=${uid}`)
            .send('coordinate=(0.0, 0.0)')
        const pid = resp1b.body.pid;
        
        //add img
        const resp2 = await request(app).post('/images/postPic/upload')
            .field('pid', pid)
            .attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp2.status, 200)
        
        //check img in db
        const resp3 = await request(app).get(`/posts/selectPost?pid=${pid}`)
        assert.strictEqual(resp3.body.message[0].imglink, resp2.body.message)

        //teardown
        await request(app).delete('/images/postPic/delete')
            .send(`pid=${pid}`)
    });

    it("IMAGES: test post profile picture upload missing uid", async () => {
        const resp = await request(app).post('/images/postPic/upload')
            .attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "pid is required")
    })

    it("IMAGES: test post upload missing img", async () => {
        const resp = await request(app).post('/images/postPic/upload')
            .field('pid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "img must be specified")
    })

})

describe("IMAGES: test user delete image", () => {
    it("IMAGES: test user delete normal", async () => {
        await teardown()
    
        //add user
        const resp1 = await request(app).post('/users/createUser')
            .send('uid=ffd')
        const uid = resp1.body.uid;
        
        //add img
        const resp2 = await request(app).post('/images/userProfilePic/upload')
            .field('uid', uid)
            .attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp2.status, 200)

        //delete img
        const resp3 = await request(app).delete('/images/userProfilePic/delete')
            .send(`uid=${uid}`)
        assert.strictEqual(resp3.status, 200)
        assert.strictEqual(resp3.body.message, 'image delete successful')

        //check img in db
        const resp4 = await request(app).get(`/users/selectUser?uid=${uid}`)
        assert.strictEqual(resp4.body.message[0].imglink, null)
    })

    it("IMAGES: test user delete missing uid", async () => {
        const resp = await request(app).delete('/images/userProfilePic/delete')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "uid is required")
    })

})

describe("IMAGES: test post delete image", () => {
    it("IMAGES: test post delete normal", async () => {
        await teardown()
    
        //add user
        const resp1 = await request(app).post('/users/createUser')
            .send('uid=ffd')
        const uid = resp1.body.uid;
        const resp1b = await request(app).post('/posts/createPost')
            .send('pid=ffd')
            .send(`uid=${uid}`)
            .send('coordinate=(0.0, 0.0)')
        const pid = resp1b.body.pid;
        
        //add img
        const resp2 = await request(app).post('/images/postPic/upload')
            .field('pid', pid)
            .attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp2.status, 200)

        //delete img
        const resp3 = await request(app).delete('/images/postPic/delete')
            .send(`pid=${pid}`)
        assert.strictEqual(resp3.status, 200)
        assert.strictEqual(resp3.body.message, 'image delete successful')

        //check img in db
        const resp4 = await request(app).get(`/posts/selectPost?pid=${pid}`)
        assert.strictEqual(resp4.body.message[0].imglink, null)
    })

    it("IMAGES: test post delete missing pid", async () => {
        const resp = await request(app).delete('/images/postPic/delete')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "pid is required")
    })

})