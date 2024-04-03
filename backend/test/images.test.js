const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const app = require('../src/app');

//TODO configure automatic teardown functionality

//remember to manually clear S3 before running test

describe("IMAGES: test upload", () => {
    it("IMAGES: test user upload normal", async () => {
        const resp = await request(app).post('/images/userProfilePic/upload')
            .field('uid', 1)
            .attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, "file upload successful")
        await request(app).delete('/images/userProfilePic/delete').send('uid',1) //teardown
    })
    it("IMAGES: test user upload missing uid", async () => {
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
    it("IMAGES: test user upload with pre-existing img", () => {
        //TODO configure deletion of pre-exisitng images when new images uploaded by same user
    })
    
    it("IMAGES: test post upload normal", async () => {
        const resp = await request(app).post('/images/postPic/upload')
            .field('pid', 1)
            .attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, "file upload successful")
        await request(app).delete('/images/userProfilePic/delete').send('pid',1) //teardown
    })
    it("IMAGES: test post upload missing pid", async () => {
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
    it("IMAGES: test post upload with pre-existing img", () => {
        //TODO configure deletion of pre-exisitng images when new images uploaded by same user
    })
})

describe("IMAGES: test access", () => {
    it("IMAGES: test user access normal", async () => {
        await request(app).post('/images/userProfilePic/upload')
            .field('uid', 1)
            .attach('img', 'test/testImages/test1.jpg')
        const resp = await request(app).get('/images/userProfilePic/access')
            .field('uid', 1)
        assert.strictEqual(resp.status, 200)
        assert.ok(resp.body.message.includes('http')) //this is about as rigorous as I can get since the urls are random
        await request(app).delete('/images/userProfilePic/delete').send('uid',1) //teardown  
    })
    it("IMAGES: test user access missing uid", async () => {
        const resp = await request(app).get('/images/userProfilePic/access')
        assert.strictEqual(resp.status, 400)
    })
    it("IMAGES: test user access, img does not exist", async () => {
        await request(app).delete('/images/userProfilePic/delete').send('uid',1) //tearup
        const resp = await request(app).get('/images/userProfilePic/access')
            .field('uid', 1)
        assert.strictEqual(resp.body.message, "file does not exist")
        assert.strictEqual(resp.status, 400)
    })

    it("IMAGES: test post access normal", async () => {
        await request(app).post('/images/postPic/upload')
            .field('pid', 1)
            .attach('img', 'test/testImages/test1.jpg')
        const resp = await request(app).get('/images/postPic/access')
            .field('pid', 1)
        assert.strictEqual(resp.status, 200)
        assert.ok(resp.body.message.includes('http')) //this is about as rigorous as I can get since the urls are random
        await request(app).delete('/images/postPic/delete').send('uid',1) //teardown  
    })
    it("IMAGES: test post access missing pid", async () => {
        const resp = await request(app).get('/images/postPic/access')
        assert.strictEqual(resp.status, 400)
    })
    it("IMAGES: test post access, img does not exist", async () => {
        await request(app).delete('/images/postPic/delete').send('pid',1) //tearup
        const resp = await request(app).get('/images/postPic/access')
            .field('pid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "file does not exist")
    })
})

describe("IMAGES: test delete", () => {
    it("IMAGES: test user delete normal", async () => {
        await request(app).post('/images/userProfilePic/upload')
            .field('uid', 1)
            .attach('img', 'test/testImages/test1.jpg')
        await request(app).delete('/images/userProfilePic/delete').send('uid',1) //teardown  
        const resp = await request(app).get('/images/userProfilePic/access')
            .field('uid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "file does not exist")
    })
    it("IMAGES: test user delete missing uid", async () => {
        const resp = await request(app).delete('/images/userProfilePic/delete')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "uid is required")
    })
    it("IMAGES: test user delete, img does not exist", async () => {
        await request(app).delete('/images/userProfilePic/delete').send('uid',1) //tearup
        const resp = await request(app).delete('/images/userProfilePic/delete')
            .field('uid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "file does not exist")
    })

    it("IMAGES: test post delete normal", async () => {
        await request(app).post('/images/postPic/upload')
            .field('pid', 1)
            .attach('img', 'test/testImages/test1.jpg')
        await request(app).delete('/images/postPic/delete').send('pid',1) //teardown  
        const resp = await request(app).get('/images/postPic/access')
            .field('pid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "file does not exist")
    })
    it("IMAGES: test post delete missing pid", async () => {
        const resp = await request(app).delete('/images/postPic/delete')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "pid is required")
    })
    it("IMAGES: test post delete, img does not exist", async () => {
        await request(app).delete('/images/postPic/delete').send('pid',1) //tearup
        const resp = await request(app).delete('/images/postPic/delete')
            .field('pid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "file does not exist")
    })
})