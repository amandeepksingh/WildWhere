// const request = require('supertest');
// const assert = require('assert');
// const { describe } = require('node:test');
// const app = require('../src/app');
// const fs = require('fs');

// before(async () => {
//     const postFiles = await fs.readdirSync("images/post")
//     for (const file of postFiles) {
//         await fs.unlinkSync(`images/post/${file}`)
//     }
//     const userFiles = await fs.readdirSync("images/user")
//     for (const file of userFiles) {
//         await fs.unlinkSync(`images/user/${file}`)
//     }
// })

// after(async () => {
//     const postFiles = await fs.readdirSync("images/post")
//     for (const file of postFiles) {
//         await fs.unlinkSync(`images/post/${file}`)
//     }
//     const userFiles = await fs.readdirSync("images/user")
//     for (const file of userFiles) {
//         await fs.unlinkSync(`images/user/${file}`)
//     }
// })

// describe("IMAGES: Test image reciept in file system: USERS", () => {
//     it("IMAGES: test missing uid to images/user", async () => {
//         const resp = await request(app).post('/images/user')
//             .attach('img', 'test/testImages/test1.jpg')
//         assert.strictEqual(resp.status, 400)
//         assert.strictEqual(resp.body.message, "missing uid")
//     })
//     it("IMAGES: test normal to images/user", async () => {
//         const resp = await request(app).post('/images/user')
//             .attach('img', 'test/testImages/test1.jpg')
//             .attach('uid', 4)
//         assert.strictEqual(resp.status, 200)
//         assert.strictEqual(resp.body.message, "image upload successful")
//         const userFiles = await fs.readdirSync("images/user")
//         assert.strictEqual(userFiles.length, 1)
//         assert.strictEqual(userFiles[0], "user-4.jpg")
//     })
//     it("IMAGES: test replacement to images/user", async () => {
//         const resp1 = await request(app).post('/images/user')
//             .attach('img', 'test/testImages/test2.jpg')
//             .attach('uid', 4)
//         assert.strictEqual(resp1.status, 200)
//         assert.strictEqual(resp1.body.message, "image upload successful")
//         const resp2 = await request(app).post('/images/user')
//             .attach('img', 'test/testImages/test2.png')
//             .attach('uid', 4)
//         assert.strictEqual(resp2.status, 200)
//         assert.strictEqual(resp2.body.message, "image upload successful")
//         const userFiles = await fs.readdirSync("images/user")
//         assert.strictEqual(userFiles.length, 1)
//         assert.strictEqual(userFiles[0], "user-4.png") //png overrides jpg
//     })
//     it("IMAGES: test multiple images from diff users to images/user", async () => {
//         const resp1 = await request(app).post('/images/user')
//             .attach('img', 'test/testImages/test2.jpg')
//             .attach('uid', 4)
//         assert.strictEqual(resp1.status, 200)
//         assert.strictEqual(resp1.body.message, "image upload successful")
//         const resp2 = await request(app).post('/images/user')
//             .attach('img', 'test/testImages/test2.png')
//             .attach('uid', 5)
//         assert.strictEqual(resp2.status, 200)
//         assert.strictEqual(resp2.body.message, "image upload successful")
//         const userFiles = await fs.readdirSync("images/user")
//         assert.strictEqual(userFiles.length, 2)
//         assert.ok(userFiles.includes("user-4.jpg"))
//         assert.ok(userFiles.includes("user-5.png"))
//     })
// })

// describe("IMAGES: Test image reciept in file system: POSTS", () => {
//     it("IMAGES: test missing pid to images/post", async () => {
//         const resp = await request(app).post('/images/post')
//             .attach('img', 'test/testImages/test1.jpg')
//         assert.strictEqual(resp.status, 400)
//         assert.strictEqual(resp.body.message, "missing pid")
//     })
//     it("IMAGES: test normal to images/post", async () => {
//         const resp = await request(app).post('/images/post')
//             .attach('img', 'test/testImages/test1.jpg')
//             .attach('pid', 4)
//         assert.strictEqual(resp.status, 200)
//         assert.strictEqual(resp.body.message, "image upload successful")
//         const userFiles = await fs.readdirSync("images/post")
//         assert.strictEqual(userFiles.length, 1)
//         assert.strictEqual(userFiles[0], "post-4.jpg")
//     })
//     it("IMAGES: test replacement to images/post", async () => {
//         const resp1 = await request(app).post('/images/post')
//             .attach('img', 'test/testImages/test2.jpg')
//             .attach('pid', 4)
//         assert.strictEqual(resp1.status, 200)
//         assert.strictEqual(resp1.body.message, "image upload successful")
//         const resp2 = await request(app).post('/images/post')
//             .attach('img', 'test/testImages/test2.png')
//             .attach('pid', 4)
//         assert.strictEqual(resp2.status, 200)
//         assert.strictEqual(resp2.body.message, "image upload successful")
//         const userFiles = await fs.readdirSync("images/post")
//         assert.strictEqual(userFiles.length, 1)
//         assert.strictEqual(userFiles[0], "post-4.png") //png overrides jpg
//     })
//     it("IMAGES: test replacement to images/post", async () => {
//         const resp1 = await request(app).post('/images/post')
//             .attach('img', 'test/testImages/test2.jpg')
//             .attach('pid', 4)
//         assert.strictEqual(resp1.status, 200)
//         assert.strictEqual(resp1.body.message, "image upload successful")
//         const resp2 = await request(app).post('/images/post')
//             .attach('img', 'test/testImages/test2.png')
//             .attach('pid', 5)
//         assert.strictEqual(resp2.status, 200)
//         assert.strictEqual(resp2.body.message, "image upload successful")
//         const userFiles = await fs.readdirSync("images/post")
//         assert.strictEqual(userFiles.length, 2)
//         assert.ok(userFiles.includes("post-4.jpg"))
//         assert.ok(userFiles.includes("post-5.png"))
//     })
// })