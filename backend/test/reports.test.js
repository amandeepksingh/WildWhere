const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const Pool = require('pg').Pool;
const app = require('../src/app');
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
    await pool.query("DELETE FROM reports;")
}

describe("selecting reports", () => {
    it("REPORTS: normal functionality with single post", async () => {
        await teardown();

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        const pid = (await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')).body.pid
        const reason = "test reason"
        await request(app).post('/reports/createReport').send(`pid=${pid}`).send(`uid=${uid}`).send(`reason=${reason}`)

        resp = await request(app).get(`/reports/selectReport?pid=${pid}&uid=${uid}&reason=${reason}`)

        assert.strictEqual(resp.status, 200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "pid": pid,
                "uid": uid,
                "reason": reason
            }
        ])
    })

    it("REPORTS: normal functionality too strict", async () => {
        await teardown();

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        const pid = (await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')).body.pid
        const reason = "test reason"
        await request(app).post('/reports/createReport').send(`pid=${pid}`).send(`uid=${uid}`).send(`reason=${reason}`)

        resp = await request(app).get(`/reports/selectReport?pid=${pid}&uid=${uid}&reason=DNE`)
        assert.strictEqual(resp.status, 200)
        assert.deepStrictEqual(resp.body.message, [])

        resp = await request(app).get(`/reports/selectReport?pid=${pid}&uid=DNE&reason=${reason}`)
        assert.strictEqual(resp.status, 200)
        assert.deepStrictEqual(resp.body.message, [])

        resp = await request(app).get(`/reports/selectReport?pid=DNE&uid=${uid}&reason=${reason}`)
        assert.strictEqual(resp.status, 200)
        assert.deepStrictEqual(resp.body.message, [])
    })

    it("REPORTS: normal functionality multiple posts", async () => {
        await teardown();

        const uid1 = 'testUID 1'
        await request(app).post('/users/createUser').send(`uid=${uid1}`)
        const pid1 = (await request(app).post('/posts/createPost').send(`uid=${uid1}`).send('coordinate=(0.0, 0.0)')).body.pid
        const reason1 = "test reason 1"
        await request(app).post('/reports/createReport').send(`pid=${pid1}`).send(`uid=${uid1}`).send(`reason=${reason1}`)
        const uid2 = 'testUID 2'
        await request(app).post('/users/createUser').send(`uid=${uid2}`)
        const pid2 = (await request(app).post('/posts/createPost').send(`uid=${uid2}`).send('coordinate=(0.0, 0.0)')).body.pid
        const reason2 = "test reason 2"
        await request(app).post('/reports/createReport').send(`pid=${pid2}`).send(`uid=${uid2}`).send(`reason=${reason2}`)

        resp = await request(app).get(`/reports/selectReport`)
        assert.strictEqual(resp.status, 200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "pid": pid1,
                "uid": uid1,
                "reason": reason1
            },
            {
                "pid": pid2,
                "uid": uid2,
                "reason": reason2
            }
        ])
    })
})

describe("creating reports", () => {
    it("REPORTS: normal functionality", async () => {
        await teardown();

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        const pid = (await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')).body.pid
        const reason = "test reason"
        const resp = await request(app).post('/reports/createReport').send(`pid=${pid}`).send(`uid=${uid}`).send(`reason=${reason}`)

        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, "report created successfully")
    })
    
    it("REPORTS: missing pid", async () => {
        await teardown();

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        const pid = (await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')).body.pid
        const reason = "test reason"
        const resp = await request(app).post('/reports/createReport').send(`uid=${uid}`).send(`reason=${reason}`)

        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "pid is required")
    })

    it("REPORTS: missing uid", async () => {
        await teardown();

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        const pid = (await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')).body.pid
        const reason = "test reason"
        const resp = await request(app).post('/reports/createReport').send(`pid=${pid}`).send(`reason=${reason}`)

        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "uid is required")
    })

    it("REPORTS: missing reason", async () => {
        await teardown();

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        const pid = (await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')).body.pid
        const reason = "test reason"
        const resp = await request(app).post('/reports/createReport').send(`pid=${pid}`).send(`uid=${uid}`)

        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "reason is required")
    })
})