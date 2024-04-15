// const request = require('supertest');
// const assert = require('assert');
// const { describe } = require('node:test');
// const app = require('../src/app');
// const getHelpTxt = require('../src/help');
// require('dotenv').config();

// //run tests with "npm test"

// describe("HELP: provide documentation on valid endpoint, invalid method", () => {
//     it("HELP: test help method", async () => {
//         const helpTxt = await getHelpTxt()
//         assert.strictEqual(helpTxt,"This endpoint or method is not supported at this time. Please refer to the following supported endpoints and methods: [GET users/selectUser, POST users/createUser, PUT users/updateUserByUID, DELETE users/deleteUserByUID, GET posts/selectPost, POST posts/createPost, PUT posts/updatePostByUID, DELETE posts/deletePostByUID]")
//     })
//     it("HELP: check every endpoint's other methods", async () => {
//         const helpTxt = await getHelpTxt()
//         assert.strictEqual((await request(app).post("/users/selectUser")).body.message, helpTxt)
//         assert.strictEqual((await request(app).put("/users/selectUser")).body.message, helpTxt)
//         assert.strictEqual((await request(app).delete("/users/selectUser")).body.message, helpTxt)
//         assert.strictEqual((await request(app).get("/users/createUser")).body.message, helpTxt)
//         assert.strictEqual((await request(app).put("/users/createUser")).body.message, helpTxt)
//         assert.strictEqual((await request(app).delete("/users/createUser")).body.message, helpTxt)
//         assert.strictEqual((await request(app).get("/users/updateUserByUID")).body.message, helpTxt)
//         assert.strictEqual((await request(app).post("/users/updateUserByUID")).body.message, helpTxt)
//         assert.strictEqual((await request(app).delete("/users/updateUserByUID")).body.message, helpTxt)
//         assert.strictEqual((await request(app).get("/users/deleteUserByUID")).body.message, helpTxt)
//         assert.strictEqual((await request(app).post("/users/deleteUserByUID")).body.message, helpTxt)
//         assert.strictEqual((await request(app).put("/users/deleteUserByUID")).body.message, helpTxt)
//     })
//     it("HELP: check every other endpoint", async () => {
//         const helpTxt = await getHelpTxt()
//         assert.strictEqual((await request(app).post("/users/selecser")).body.message, helpTxt)
//         assert.strictEqual((await request(app).get("/users/seser")).body.message, helpTxt)
//         assert.strictEqual((await request(app).post("/posts/selecser")).body.message, helpTxt)
//         assert.strictEqual((await request(app).put("/sere")).body.message, helpTxt)
//         assert.strictEqual((await request(app).delete("/")).body.message, helpTxt)
//     })
// });