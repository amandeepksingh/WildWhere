const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const app = require('../src/app');
const logger = require('../src/logger');
const Pool = require('pg').Pool;
require('dotenv').config();

var pool;
var poolObj = {
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
};
if(process.env.location !== "local") poolObj.ssl = {rejectUnauthorized: false}; //for server pool
pool = new Pool(poolObj);

async function teardown() {
    await pool.query("DELETE FROM users;")
    await pool.query("DELETE FROM posts;")
}
    

describe("IMAGES: test user image upload", () => {
    it("IMAGES: test user normal functionality", async () => {
        await teardown();

        //create user
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        //add img
        const resp1 = await request(app).post('/images/userProfilePic/upload').field('uid', uid).attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp1.status, 200)
        const url1 = resp1.body.message
        assert.ok(url1.includes('http'), "valid url returned by upload")
        
        //check img in db
        const resp2 = await request(app).get(`/users/selectUser?uid=${uid}`)
        const url2 = resp2.body.message[0].imglink
        assert.ok(url2.includes('http'), "valid url put to database by upload")

        //check url from s3 matching one in db
        assert.strictEqual(url1, url2, 'same url from upload put to database')

        //teardown
        await request(app).delete(`/images/userProfilePic/delete?uid=${uid}`)
    });

    it("IMAGES: test user profile picture upload missing uid", async () => {
        const resp = await request(app).post('/images/userProfilePic/upload').attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "uid is required")
    })

    it("IMAGES: test user upload missing img", async () => {
        const resp = await request(app).post('/images/userProfilePic/upload').field('uid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "img must be specified")
    })

    it("IMAGES: test user override", async () => {
        await teardown();

        //create user
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        //add img
        const resp1 = await request(app).post('/images/userProfilePic/upload').field('uid', uid).attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp1.status, 200)
        const url1 = resp1.body.message
        assert.ok(url1.includes('http'), "valid url returned by upload")

        //add img again
        const resp2 = await request(app).post('/images/userProfilePic/upload').field('uid', uid).attach('img', 'test/testImages/test2.jpg')
        assert.strictEqual(resp2.status, 200)
        const url2 = resp2.body.message
        assert.ok(url2.includes('http'), "valid url returned by upload")

        const resp3 = await request(app).get(`/users/selectUser?uid=${uid}`)
        const url3 = resp3.body.message[0].imglink
        assert.ok(url3.includes('http'), "check img in db")

        assert.strictEqual(url2, url3, 'check url from s3 matching one in db')

        //teardown
        await request(app).delete(`/images/userProfilePic/delete?uid=${uid}`)
    });
})

describe("IMAGES: test post image upload", () => {
    it("IMAGES: test post normal functionality", async () => {
        await teardown();

        //create user
        const uid = "testUID"
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        const pid = (await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')).body.pid

        //add img
        const resp1 = await request(app).post('/images/postPic/upload').field('pid', pid).attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp1.status, 200)
        const url1 = resp1.body.message
        
        const resp2 = await request(app).get(`/posts/selectPost?pid=${pid}`)
        const url2 = resp2.body.message[0].imglink

        assert.strictEqual(url1, url2, 'url from post matches url in db')

        //teardown
        await request(app).delete(`/images/postPic/delete?pid=${pid}`)
    });

    it("IMAGES: test post profile picture upload missing pid", async () => {
        const resp = await request(app).post('/images/postPic/upload').attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "pid is required")
    })

    it("IMAGES: test post upload missing img", async () => {
        const resp = await request(app).post('/images/postPic/upload').field('pid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "img must be specified")
    })

    it("IMAGES: test post override", async () => {
        await teardown();

        //create user + post
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        const pid = (await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')).body.pid

        //add img
        const resp1 = await request(app).post('/images/postPic/upload').field('pid', pid).attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp1.status, 200)
        const url1 = resp1.body.message
        assert.ok(url1.includes('http'), "valid url returned by upload")

        //add img again
        const resp2 = await request(app).post('/images/postPic/upload').field('pid', pid).attach('img', 'test/testImages/test2.jpg')
        assert.strictEqual(resp2.status, 200)
        const url2 = resp2.body.message
        assert.ok(url2.includes('http'), "valid url returned by upload")

        const resp3 = await request(app).get(`/posts/selectPost?pid=${pid}`)
        const url3 = resp3.body.message[0].imglink
        assert.ok(url3.includes('http'), "check img in db")

        assert.strictEqual(url2, url3, 'check url from s3 matching one in db')

        //teardown
        await request(app).delete(`/images/postPic/delete?pid={pid}`)
    });

})

describe("IMAGES: test user delete image", () => {
    it("IMAGES: test user delete normal", async () => {
        await teardown()
    
        //add user
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        //add img
        await request(app).post('/images/userProfilePic/upload').field('uid', uid).attach('img', 'test/testImages/test1.jpg')

        //delete img
        const resp1 = await request(app).delete(`/images/userProfilePic/delete?uid=${uid}`)
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, 'image delete successful')

        const resp2 = await request(app).get(`/users/selectUser?uid=${uid}`)
        assert.strictEqual(resp2.body.message[0].imglink, null, "check img purged from db")
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
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        const pid = (await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')).body.pid
        
        //add img
        await request(app).post('/images/postPic/upload').field('pid', pid).attach('img', 'test/testImages/test1.jpg')

        //delete img
        const resp1 = await request(app).delete(`/images/postPic/delete?pid=${pid}`)
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, 'image delete successful')

        //check img in db
        const resp2 = await request(app).get(`/posts/selectPost?pid=${pid}`)
        assert.strictEqual(resp2.body.message[0].imglink, null)
    })

    it("IMAGES: test post delete missing pid", async () => {
        const resp = await request(app).delete('/images/postPic/delete')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "pid is required")
    })

})