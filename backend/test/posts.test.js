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
    await pool.query("ALTER SEQUENCE users_uid_seq RESTART WITH 1;")
    await pool.query("ALTER SEQUENCE posts_pid_seq RESTART WITH 1;")
    //await pool.query("SELECT setval('posts_pid_seq', 1, true);")
    //await pool.query("SELECT setval('users_uid_seq', 1, true);")
}

describe("selecting posts", () => {
    //TODO
    //Note that this may be complicated due to coordinates.
    //May need another function to select posts that are within a certain coordinate circle
    
        it("POST: test select with empty", async () => {
            await teardown()
            const resp = await request(app)
            .get('/posts/selectPost')
            .send('coordinate=(0.0, 0.0)') //send body parameters
            assert.strictEqual(resp.status,200)
            assert.deepStrictEqual(resp.body.message, [])
        })
        it("POST: test select with too strict constraints", async () => {
            await teardown()
            
            const create_user = await request(app)
            .post('/users/createUser')

            const resp1 = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(0.0, 0.0)')

            assert.strictEqual(resp1.body.message, "post created")

            const resp2 = await request(app)
            .get('/posts/selectPost')
            .send('uid=1') //send body parameters
            .send('coordinate=(0.0, 0.0)')
            assert.strictEqual(resp2.status,200)
            assert.deepStrictEqual(resp2.body.message, [
                {
                    "pid": 1,
                    "uid": 1,
                    "imglink": null,
                    "datetime": null,
                    "coordinate": {"x": 0.0, "y": 0.0}
                }
            ])
        })
        it("POST: test select with ALL constraints", async () => {
            await teardown()

            const create_user = await request(app)
            .post('/users/createUser')

            const resp1 = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('datetime=1997-12-17 07:37:16-08') //check formating
            .send('coordinate=(2.5, 7.9)') //check single quotes
            const resp2 = await request(app)
            .get('/posts/selectPost')
            .send('pid=1')
            .send('uid=1')
            //T(HOUR + 5) ... + .000Z at the end
            .send('datetime=1997-12-17 07:37:16-08')
            .send('coordinate=(2.5, 7.9)')
            assert.strictEqual(resp2.status,200)
            assert.deepStrictEqual(resp2.body.message, [
                {
                    "pid": 1,
                    "uid": 1,
                    "imglink": null,
                    "datetime": '1997-12-17T12:37:16.000Z', 
                    "coordinate": {"x": 2.5, "y": 7.9} 
                }
            ])
        })
        it("POST: test select with multiple posts", async () => {
            await teardown()

            const create_user = await request(app)
            .post('/users/createUser')

            const resp1 = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(3.6, 5.8)')

            const resp1b = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(2.6, 7.5)')
            const resp2 = await request(app)
            .get('/posts/selectPost')
            .send('uid=1')
            assert.strictEqual(resp2.status,200)
            assert.deepStrictEqual(resp2.body.message, [
                {
                    "pid": 1,
                    "uid": 1,
                    "imglink": null,
                    "datetime": null,
                    "coordinate": {"x": 3.6, "y": 5.8}
                },
                {
                    "pid": 2,
                    "uid": 1,
                    "imglink": null,
                    "datetime": null,
                    "coordinate": {"x": 2.6, "y": 7.5}
                }
            ])
        })
        it("POST: null radius", async () => {
            await teardown()

            const create_user = await request(app)
            .post('/users/createUser')
            
            const resp1 = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(177.0, 0.0)')
            const resp1b = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(2.6, 0.0)')
            const resp2 = await request(app)
            .get('/posts/selectPost')
            .send('coordinate=(177.0, 0.0)')
            assert.strictEqual(resp2.status,200)
            assert.deepStrictEqual(resp2.body.message, [
                {
                    "pid": 1,
                    "uid": 1,
                    "imglink": null,
                    "datetime": null,
                    "coordinate": {"x": 177.0, "y": 0.0} //tuple
                }
            ])
        })
        it("POST: zero radius", async () => {
            await teardown()

            const create_user = await request(app)
            .post('/users/createUser')

            const resp1 = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(177.0, 0.0)')
            const resp1b = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(2.6, 0.0)')
            const resp2 = await request(app)
            .get('/posts/selectPost')
            .send('radius=0')
            .send('coordinate=(177.0, 0.0)')
            assert.strictEqual(resp2.status,200)
            assert.deepStrictEqual(resp2.body.message, [
                {
                    "pid": 1,
                    "uid": 1,
                    "imglink": null,
                    "datetime": null,
                    "coordinate": {"x": 177.0, "y": 0.0} //tuple
                }
            ])
        })
        it("POST: non-zero radius", async () => {
            await teardown()

            const create_user = await request(app)
            .post('/users/createUser')

            const resp1 = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(177.0, 0.0)')
            const resp1b = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(50.0, 50.0)')
            const resp1c = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(-0.5, 0.5)')
            const resp1d = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(100.0, 0.0)')
            const resp2 = await request(app)
            .get('/posts/selectPost')
            .send('radius=8000')
            .send('coordinate=(177.0, 0.0)')
            assert.strictEqual(resp2.status,200)
            assert.deepStrictEqual(resp2.body.message, [
                {
                    "pid": 1,
                    "uid": 1,
                    "imglink": null,
                    "datetime": null,
                    "coordinate": {"x":177.0, "y":0.0} 
                },
                {
                    "pid": 2,
                    "uid": 1,
                    "imglink": null,
                    "datetime": null,
                    "coordinate": {"x":50.0, "y":50.0}
                },
                {
                    "pid": 4,
                    "uid": 1,
                    "imglink": null,
                    "datetime": null,
                    "coordinate": {"x":100.0, "y":0.0}
                }
            ])
        })
        it("POST: after a time", async () => {
            await teardown()

            const create_user = await request(app)
            .post('/users/createUser')
            
            const resp1 = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('datetime=1997-12-17 07:37:16')
            .send('coordinate=(177.0, 0.0)')
            const resp1b = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('datetime=2008-12-17 07:37:16')
            .send('coordinate=(2.6, 0.0)')
            const resp2 = await request(app)
            .get('/posts/selectPost')
            .send('starttime=2000/12/17/07:37:16')
            assert.strictEqual(resp2.status,200)
            assert.deepStrictEqual(resp2.body.message, [
                {
                    "pid": 2,
                    "uid": 1,
                    "imglink": null,
                    "datetime": '2008-12-17T12:37:16.000Z',
                    "coordinate": {"x": 2.6, "y": 0.0} //tuple
                }
            ])
        })
        it("POST: before a time", async () => {
            await teardown()

            const create_user = await request(app)
            .post('/users/createUser')
            
            const resp1 = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('datetime=1997-12-17 07:37:16')
            .send('coordinate=(177.0, 0.0)')
            const resp1b = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('datetime=2008-12-17 07:37:16')
            .send('coordinate=(2.6, 0.0)')
            const resp2 = await request(app)
            .get('/posts/selectPost')
            .send('endtime=2000/12/17/07:37:16')

            assert.strictEqual(resp2.status,200)
            assert.deepStrictEqual(resp2.body.message, [
                {
                    "pid": 1,
                    "uid": 1,
                    "imglink": null,
                    "datetime": '1997-12-17T12:37:16.000Z',
                    "coordinate": {"x": 177.0, "y": 0.0} //tuple
                }
            ])
        })
        it("POST: between a time", async () => {
            await teardown()

            const create_user = await request(app)
            .post('/users/createUser')
            
            const resp1 = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('datetime=1997-12-17 07:37:16')
            .send('coordinate=(177.0, 0.0)')
            const resp1b = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('datetime=2008-12-17 07:37:16')
            .send('coordinate=(2.6, 0.0)')
            const resp1c = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('datetime=2010-12-17 07:37:16')
            .send('coordinate=(2.6, 0.0)')
            const resp2 = await request(app)
            .get('/posts/selectPost')
            .send('starttime=2007/12/17/07:37:16')
            .send('endtime=2009/12/17/07:37:16')

            assert.strictEqual(resp2.status,200)
            assert.deepStrictEqual(resp2.body.message, [
                {
                    "pid": 2,
                    "uid": 1,
                    "imglink": null,
                    "datetime": '2008-12-17T12:37:16.000Z',
                    "coordinate": {"x": 2.6, "y": 0.0} //tuple
                }
            ])
        })
})

describe("creating posts", () => {
   it("POST: test create without uid", async () => {
    await teardown()
    const resp = await request(app)
    .post('/posts/createPost')
    .send('coordinate=(0.5, 0.5)')
    assert.strictEqual(resp.status, 400)
    assert.strictEqual(resp.body.message, "missing uid")
})

it("POST: test create without coordinates", async () => {
    await teardown()

    const create_user = await request(app)
            .post('/users/createUser')

    const resp = await request(app)
    .post('/posts/createPost')
    .send('uid=1')
    assert.strictEqual(resp.status, 400)
    assert.strictEqual(resp.body.message, "missing coordinates")
})
//missing coordinates
   it("POST: test create with only pid and uid and coordinates", async () => {
        await teardown()
        const resp2 = await request(app)
        .post('/users/createUser')
        assert.strictEqual(resp2.status, 200)
        const resp = await request(app)
        .post('/posts/createPost')
        .send(`uid=1`)
        .send(`coordinate=(2.6, 7.5)`)
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, "post created")
   })
   it("POST: test create POST with all params", async () => {
        await teardown()
        const resp1 = await request(app)
        .post('/users/createUser')
        
        const resp2 = await request(app)
        .post('/posts/createPost')
        .send(`uid=1`)
        .send(`imgLink=test_link`)
        .send(`datetime=1999-01-08 04:05:06`)
        .send(`coordinate=(2.6, 7.5)`)
        assert.strictEqual(resp2.body.message, `post created`)
        assert.strictEqual(resp2.status, 200)
   })
   it("POST: test create with some but not all params", async () => {
    await teardown()
    const create_user = await request(app)
    .post('/users/createUser')


    const resp = await request(app)
    .post('/posts/createPost')
    .send('uid=1')
    .send(`imgLink=test_link`)
    .send(`coordinate=(0.0,0.0)`)
    assert.strictEqual(resp.body.message, `post created`)
    assert.strictEqual(resp.status, 200)
   })
})

describe("updating posts", () => {
    it("POST: update post with imgLink", async () => {//test with coordinate and datetime later on
        await teardown()

        const b = await request(app)
        .post('/users/createUser')

        const resp1 = await request(app)
        .post('/posts/createPost')
        .send('uid=1')
        .send('coordinate=(0.0,0.0)')
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `post created`)
        
        const resp2 = await request(app)
        .put('/posts/updatePostByPID')
        .send('pid=1')
        .send('imgLink=test_link')
        assert.strictEqual(resp2.status, 200)
        assert.strictEqual(resp2.body.message, `post updated`)

        const resp3 = await request(app)
        .get('/posts/selectPost')
        .send('pid=1')
        assert.strictEqual(resp3.status, 200)
        assert.deepStrictEqual(resp3.body.message, 
            [
                {
                    "pid": 1,
                    "uid": 1,
                    "imglink": "test_link",
                    "datetime": null,
                    "coordinate": {"x":0.0, "y":0.0}
                }
            ]
        ) 
    })
})

describe("deleting posts", () => {
    it("POST: delete post by PID", async () => {
        await teardown()

        const create_user = await request(app)
            .post('/users/createUser')

        assert.strictEqual(create_user.body.message,'user created')
        assert.strictEqual(create_user.status, 200)

        const resp1 = await request(app)
            .post('/posts/createPost')
            .send('uid=1')
            .send('coordinate=(0.0, 0.0)')

        assert.strictEqual(resp1.body.message, `post created`)
        assert.strictEqual(resp1.status, 200)
        

        const resp2 = await request(app)
        .delete('/posts/deletePostByPID')
        .send('pid=1')


        assert.strictEqual(resp2.body.message, `post with pid 1 deleted if existed`)
        assert.strictEqual(resp2.status, 200)

        const resp3 = await request(app)
        .get('/posts/selectPost')
        .send('pid=1')

        

        assert.strictEqual(resp3.status, 200)
        assert.deepStrictEqual(resp3.body.message, [])
    }) 
    it("POST: delete post by ID where ID not listed", async () => {
        await teardown()
        const resp2 = await request(app)
        .delete('/posts/deletePostByPID')
        .send('pid=5')
        assert.strictEqual(resp2.status, 200)
        assert.strictEqual(resp2.body.message, `post with pid 5 deleted if existed`)
    }) 
})