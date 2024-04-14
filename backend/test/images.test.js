const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const app = require('../src/app');

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
         await pool.query("ALTER SEQUENCE users_uid_seq RESTART WITH 1;")
         await pool.query("ALTER SEQUENCE posts_pid_seq RESTART WITH 1;")
         //await pool.query("SELECT setval('posts_pid_seq', 1, true);")
         //await pool.query("SELECT setval('users_uid_seq', 1, true);")
     }
    

//remember to manually clear S3 before running test


//dont use access anymore, change file structure, check DB changes

describe("IMAGES: test upload", () => {

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

    //No need for this test, overwrites image for now, LOG as BUG
    it("IMAGES: test user upload with pre-existing img", () => {
        //TODO configure deletion of pre-exisitng images when new images uploaded by same user
    })

    it("IMAGES: test user upload normal", async () => {
      
        await teardown()

        //CREATES A USER
        const resp2 = await request(app)
         .post('/users/createUser')
         assert.strictEqual(resp2.status, 200)

        //UPLOADS PROFILE PICTURE
        const resp = await request(app).post('/images/userProfilePic/upload')
            .field('uid', 1)
            .attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, "file upload successful")

        //QUERIES USERS TABLE TO CHECK FOR LINK
        const resp4 = await request(app)
             .get('/users/selectUser')
             .send('uid=1')
             assert.strictEqual(resp4.status,200)
             //pfpLink is NULL, SHOULD HAVE THE LINK, s3DOWNLOAD FILE NOT WORKING 
             assert.deepEqual(resp4.body.message.pfplink.includes('http'), true) //<--------------------------FAILING HERE    

        await request(app).delete('/images/userProfilePic/delete').send('uid',1) //teardown
        await teardown()
    })
      
    
    it("IMAGES: test post upload missing uid", async () => {
        const resp = await request(app).post('/images/postPic/upload')
            .attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "uid is required")
    })
    it("IMAGES: test post upload missing pid", async () => {
        const resp = await request(app).post('/images/postPic/upload')
            .field('uid', 1)
            .attach('img', 'test/testImages/test1.jpg')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "pid is required")
    })
    it("IMAGES: test post upload missing img", async () => {
        const resp = await request(app).post('/images/postPic/upload')
            .field('uid', 1)
            .field('pid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "img must be specified")
    })

    //No need, will just re-write the image
    it("IMAGES: test post upload with pre-existing img", () => {
        //TODO configure deletion of pre-exisitng images when new images uploaded by same user
    })
    
    it("IMAGES: test post upload normal", async () => {
        
        await teardown()

        //CREATES A USER
        const resp2 = await request(app)
         .post('/users/createUser')
         assert.strictEqual(resp2.status, 200)

         //CREATES A POST
         const resp3 = await request(app)
         .post('/posts/createPost')
         .send(`uid=1`)
         .send(`coordinate=(2.6, 7.5)`)
         assert.strictEqual(resp3.status, 200)
         assert.strictEqual(resp3.body.message, "post created")

         //UPLOADS POST PICTURE
        const resp = await request(app).post('/images/postPic/upload')
            .field('uid', 1)
            .field('pid', 1)
            .attach('img', 'test/testImages/test1.jpg')

        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, "file upload successful")

        //QUERIES POSTS TABLE
        const resp4 = await request(app)
             .get('/posts/selectPost')
             .send('pid=1')
             assert.strictEqual(resp4.status,200)
             //pfpLink is NULL, SHOULD HAVE THE LINK, s3DOWNLOAD FILE NOT WORKING 
             assert.deepEqual(resp4.body.message.imglink.includes('http'), true) //<--------------------------FAILING HERE 

        await request(app).delete('/images/userProfilePic/delete').send('pid', 1) //teardown
    })
    
    
})

/*
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
*/



describe("IMAGES: test delete", () => {

    it("IMAGES: test user delete missing uid", async () => {
        const resp = await request(app).delete('/images/userProfilePic/delete')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "uid is required")
    })

    
    it("IMAGES: test user delete, img does not exist", async () => {
        const resp = await request(app).delete('/images/userProfilePic/delete')
            .field('uid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "file does not exist")
    })


    it("IMAGES: test user delete normal", async () => {

        await teardown()

        //CREATES A USER
        const resp2 = await request(app)
         .post('/users/createUser')
         assert.strictEqual(resp2.status, 200)

        //UPLOADS PROFILE PICTURE
        await request(app).post('/images/userProfilePic/upload')
            .field('uid', 1)
            .attach('img', 'test/testImages/test1.jpg')
        
        //ATTEMPTS DELETE
        await request(app).delete('/images/userProfilePic/delete').send('uid',1) //teardown  

        //QUERIES USER TABLE
        const resp4 = await request(app)
        .get('/users/selectUser')
        .send('uid=1')
        assert.strictEqual(resp4.status,200)
        assert.deepEqual(resp4.body.message.pfplink === null, true)      


        /*
        const resp = await request(app).get('/images/userProfilePic/access')
            .field('uid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "file does not exist")
        */
    })
    
    it("IMAGES: test post delete missing uid", async () => {
        const resp = await request(app).delete('/images/postPic/delete')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "uid is required")
    })
    it("IMAGES: test post delete missing pid", async () => {
        const resp = await request(app).delete('/images/postPic/delete')
            .field('uid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "pid is required")
    })
    it("IMAGES: test post delete, img does not exist", async () => {
        const resp = await request(app).delete('/images/postPic/delete')
            .field('uid', 1).field('pid',1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "file does not exist")
    })

    it("IMAGES: test post delete normal", async () => {

        await teardown()

       //CREATES A USER
       const resp2 = await request(app)
       .post('/users/createUser')
       assert.strictEqual(resp2.status, 200)

       //CREATES POST
       const resp3 = await request(app)
         .post('/posts/createPost')
         .send(`uid=1`)
         .send(`coordinate=(2.6, 7.5)`)
         assert.strictEqual(resp3.status, 200)
         assert.strictEqual(resp3.body.message, "post created")

        //UPLOADS POST PICTURE
        await request(app).post('/images/postPic/upload')
            .field('pid', 1)
            .attach('img', 'test/testImages/test1.jpg')

        //ATTEMPTS DELETE
        await request(app).delete('/images/postPic/delete').send('pid',1)
        
        //QUERIES POST TABLE
         const resp4 = await request(app)
         .get('/posts/selectPost')
         .send('pid=1')
         assert.strictEqual(resp4.status,200)
         assert.deepEqual(resp4.body.message.imglink === null, true)

        /*
        const resp = await request(app).get('/images/postPic/access')
            .field('pid', 1)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "file does not exist")
        */
    })
})