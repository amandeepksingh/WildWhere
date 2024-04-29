const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const Pool = require('pg').Pool;
const app = require('../src/app');
const logger = require('../src/logger');
require('dotenv').config();

//run tests with "npm test"

//create db connection
var poolParams = {
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
};
if(process.env.location !== "local") poolParams.ssl = {rejectUnauthorized: false}; //for server pool
const pool = new Pool(poolParams);

//clear db
async function teardown() {
    await pool.query("DELETE FROM users;")
    await pool.query("DELETE FROM posts;")
}

describe("selecting posts", () => {
    
    it("POST: test select with empty", async () => {
        await teardown()
        const resp = await request(app).get('/posts/selectPost?coordinate=(0.0, 0.0)')

        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [])
    })

    it("POST: test select with too strict constraints", async () => {
        await teardown()
        
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')
        assert.strictEqual(resp1.body.message, "post created")
        const pid = resp1.body.pid

        const resp2 = await request(app).get(`/posts/selectPost?pid=${pid}&animalName=bear`)
        assert.strictEqual(resp2.status, 200)
        assert.deepStrictEqual(resp2.body.message, [])
    })
    
    it("POST: test select with few constraints", async () => {
        await teardown()
        
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')
        assert.strictEqual(resp1.body.message, "post created")
        const pid = resp1.body.pid

        const resp = await request(app).get(`/posts/selectPost?uid=${uid}`) //send body parameters
        assert.strictEqual(resp.status, 200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "pid": pid,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x": 0.0, "y": 0.0},
                "activity": null,
                "animalname": null,
                "quantity": null
            }
        ])
    })

    it("POST: test select with radius but no coord", async () => {
        await teardown()
        
        const resp = await request(app)
        .get(`/posts/selectPost?pid=tempPid&radius=5`) //send body parameters
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "non-null search radius entered with null coordinates")
    })

    it("POST: test select with ALL constraints (minus datetime and radius)", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(2.5, 7.9)').send('animalName=John').send('quantity=8').send('activity=running')
        const pid = resp1.body.pid

        const resp2 = await request(app)
        .get(`/posts/selectPost?pid=${pid}&uid=${uid}&coordinate=(2.5, 7.9)&quantity=8&activity=running`)
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [
            {
                "pid": pid,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x": 2.5, "y": 7.9},
                "activity": "running",
                "animalname": "John",
                "quantity": 8
            }
        ])
    })

    it("POST: test select with multiple posts", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(3.6, 5.8)')
        const pid1 = resp1.body.pid
        const resp2 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(2.6, 7.5)')
        const pid2 = resp2.body.pid

        const resp = await request(app).get(`/posts/selectPost?uid=${uid}`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "pid": pid1,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x": 3.6, "y": 5.8},
                "activity": null,
                "animalname": null,
                "quantity": null
            },
            {
                "pid": pid2,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x": 2.6, "y": 7.5},
                "activity": null,
                "animalname": null,
                "quantity": null
            }
        ])
    })

    it("POST: null radius", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(177.0, 0.0)')
        const pid1 = resp1.body.pid

        const resp2 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(2.6, 0.0)')

        const resp = await request(app).get(`/posts/selectPost?coordinate=(177.0, 0.0)`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "pid": pid1,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x": 177.0, "y": 0.0},
                "activity": null,
                "animalname": null,
                "quantity": null
            }
        ])
    })

    it("POST: zero radius", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(177.0, 0.0)')
        const pid1 = resp1.body.pid

        const resp2 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(2.6, 0.0)')

        const resp = await request(app).get(`/posts/selectPost?coordinate=(177.0, 0.0)&radius=0`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "pid": pid1,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x": 177.0, "y": 0.0},
                "activity": null,
                "animalname": null,
                "quantity": null
            }
        ])
    })

    it("POST: non-zero radius", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(177.0, 0.0)')
        const pid1 = resp1.body.pid
        const resp2 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(50.0, 50.0)')
        const pid2 = resp2.body.pid
        const resp3 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(-0.5, 0.5)')
        const pid3 = resp3.body.pid
        const resp4 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(100.0, 0.0)')
        const pid4 = resp4.body.pid

        const resp = await request(app).get(`/posts/selectPost?radius=8000&coordinate=(177.0, 0.0)`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "pid": pid1,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x":177.0, "y":0.0},
                "activity": null,
                "animalname": null,
                "quantity": null
            },
            {
                "pid": pid2,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x":50.0, "y":50.0},
                "activity": null,
                "animalname": null,
                "quantity": null
            },
            {
                "pid": pid4,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x":100.0, "y":0.0},
                "activity": null,
                "animalname": null,
                "quantity": null
            }
        ])
    })

    it("POST: after a time", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=1997-12-17 07:37:16').send('coordinate=(177.0, 0.0)')
        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=2008-12-17 07:37:16').send('coordinate=(2.6, 0.0)')
        const pid = resp1.body.pid
        
        const resp2 = await request(app)
        .get(`/posts/selectPost?starttime=2000/12/17/07:37:16`)
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [
            {
                "pid": pid,
                "uid": uid,
                "imglink": null,
                "datetime": '2008-12-17T12:37:16.000Z',
                "coordinate": {"x": 2.6, "y": 0.0},
                "activity": null,
                "animalname": null,
                "quantity": null
            }
        ])
    })

    it("POST: before a time", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=1997-12-17 07:37:16').send('coordinate=(177.0, 0.0)')
        const pid1 = resp1.body.pid
        await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=2008-12-17 07:37:16').send('coordinate=(2.6, 0.0)')

        const resp = await request(app)
        .get(`/posts/selectPost?endtime=2000/12/17/07:37:16`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "pid": pid1,
                "uid": uid,
                "imglink": null,
                "datetime": '1997-12-17T12:37:16.000Z',
                "coordinate": {"x": 177.0, "y": 0.0},
                "activity": null,
                "animalname": null,
                "quantity": null
            }
        ])
    })
    
    it("POST: between a time", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=1997-12-17 07:37:16').send('coordinate=(177.0, 0.0)')
        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=2008-12-17 07:37:16').send('coordinate=(2.6, 0.0)')
        const pid = resp1.body.pid
        await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=2010-12-17 07:37:16').send('coordinate=(2.6, 0.0)')
        
        const resp2 = await request(app)
        .get(`/posts/selectPost?starttime=2007/12/17/07:37:16&endtime=2009/12/17/07:37:16`)
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [
            {
                "pid": pid,
                "uid": uid,
                "imglink": null,
                "datetime": '2008-12-17T12:37:16.000Z',
                "coordinate": {"x": 2.6, "y": 0.0},
                "activity": null,
                "animalname": null,
                "quantity": null
            }
        ])
    })

    it("POST: camel instead of lowercase times", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        await request(app).post('/posts/createPost').send(`uid=${uid}`).send('dateTime=1997-12-17 07:37:16').send('coordinate=(177.0, 0.0)')
        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('dateTime=2008-12-17 07:37:16').send('coordinate=(2.6, 0.0)')
        const pid = resp1.body.pid
        await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=2010-12-17 07:37:16').send('coordinate=(2.6, 0.0)')
        
        const resp2 = await request(app).get(`/posts/selectPost?startTime=2007/12/17/07:37:16&endTime=2009/12/17/07:37:16`)
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [
            {
                "pid": pid,
                "uid": uid,
                "imglink": null,
                "datetime": '2008-12-17T12:37:16.000Z',
                "coordinate": {"x": 2.6, "y": 0.0},
                "activity": null,
                "animalname": null,
                "quantity": null
            }
        ])
    })

    it("POST: lowercase animalName", async () => {
        await teardown()
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('animalname=tyrone').send('coordinate=(177.0, 0.0)')
        const pid = resp1.body.pid

        const resp2 = await request(app).get('/posts/selectPost?animalname=tyrone')
        assert.strictEqual(resp2.status,200)
        assert.deepStrictEqual(resp2.body.message, [
            {
                "pid": pid,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x": 177.0, "y": 0.0},
                "activity": null,
                "animalname": 'tyrone',
                "quantity": null
            }
        ])

        const resp3 = await request(app).get('/posts/selectPost?animalname=notTyrone')
        assert.strictEqual(resp3.status,200)
        assert.deepStrictEqual(resp3.body.message, [])
    })
})

describe("creating posts", () => {
    it("POST: test create without uid", async () => {
        await teardown()
        const resp = await request(app).post('/posts/createPost').send('coordinate=(0.5, 0.5)')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "uid is required")
    })

    it("POST: test create without coordinates", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send('uid=${uid}')

        const resp = await request(app).post('/posts/createPost').send(`uid=${uid}`)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "coordinate is required")
    })
    
    it("POST: test create with only uid and coordinates", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp = await request(app).post('/posts/createPost').send(`uid=${uid}`).send(`coordinate=(2.6, 7.5)`)
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, "post created")
   })

    it("POST: test create post with all params", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp = await request(app).post('/posts/createPost').send(`uid=${uid}`).send(`imgLink=test_link`).send(`datetime=1999-01-08 04:05:06`)
            .send(`coordinate=(2.6, 7.5)`).send(`quantity=2`).send(`activity=running`)
        assert.strictEqual(resp.body.message, `post created`)
        assert.strictEqual(resp.status, 200)
    })

   it("POST: test create with some but not all params", async () => {
    await teardown()

    const uid = 'testUID'
    await request(app).post('/users/createUser').send(`uid=${uid}`)

    const resp = await request(app).post('/posts/createPost').send(`uid=${uid}`).send(`imglink=test_link`).send(`coordinate=(0.0,0.0)`)
    assert.strictEqual(resp.body.message, `post created`)
    assert.strictEqual(resp.status, 200)
   })
})

describe("updating posts", () => {
    it("POST: update post with imgLink", async () => {//test with coordinate and datetime later on
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send(`coordinate=(2.6, 7.5)`).send(`imgLink=test_link`)
        const pid = resp1.body.pid
        
        const resp2 = await request(app).put('/posts/updatePostByPID').send(`pid=${pid}`).send('imgLink=test_link')
        assert.strictEqual(resp2.status, 200)
        assert.strictEqual(resp2.body.message, `post with pid ${pid} updated`)

        const resp3 = await request(app).get(`/posts/selectPost?pid=${pid}`)
        assert.strictEqual(resp3.status, 200)
        assert.deepStrictEqual(resp3.body.message, 
            [
                {
                    "pid": pid,
                    "uid": uid,
                    "imglink": "test_link",
                    "datetime": null,
                    "coordinate": {"x":2.6, "y":7.5},
                    "activity": null,
                    "animalname": null,
                    "quantity": null
                }
            ]
        ) 
    })
    
    it("POST: update post with empty imgLink", async () => {//test with coordinate and datetime later on
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0,0.0)')
        const pid = resp1.body.pid
        
        const empty = ""
        const resp2 = await request(app).put('/posts/updatePostByPID').send(`pid=${pid}`).send(`imgLink=${empty}`)
        assert.strictEqual(resp2.status, 200)
        assert.strictEqual(resp2.body.message, `post with pid ${pid} updated`)

        const resp3 = await request(app).get(`/posts/selectPost?pid=${pid}`)
        assert.strictEqual(resp3.status, 200)
        assert.deepStrictEqual(resp3.body.message, 
            [
                {
                    "pid": pid,
                    "uid": uid,
                    "imglink": '',
                    "datetime": null,
                    "coordinate": {"x":0.0, "y":0.0},
                    "activity": null,
                    "animalname": null,
                    "quantity": null
                }
            ]
        ) 
    })

    it("POST: update post without pid", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp = await request(app).put('/posts/updatePostByPID').send('imgLink=test_link')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `pid is required`)
    })

    it("POST: update post without updates", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0,0.0)')
        const pid = resp1.body.pid
        
        const resp2 = await request(app).put('/posts/updatePostByPID').send(`pid=${pid}`)
        assert.strictEqual(resp2.status, 400)
        assert.strictEqual(resp2.body.message, `at least one update is required`)
    })

    it("POST: update post, update with camelcase", async () => {
        await teardown()
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0,0.0)')
        const pid = resp.body.pid
        
        const resp1 = await request(app).put('/posts/updatePostByPID').send(`pid=${pid}`).send('imgLink=tempLink')
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `post with pid ${pid} updated`)

        const resp2 = await request(app).get(`/posts/selectPost?pid=${pid}`)
        assert.deepStrictEqual(resp2.body.message, 
            [
                {
                    "pid": pid,
                    "uid": uid,
                    "imglink": "tempLink",
                    "datetime": null,
                    "coordinate": {"x":0.0, "y":0.0},
                    "activity": null,
                    "animalname": null,
                    "quantity": null
                }
            ]
        ) 
    })

    it("POST: update post, update with lowercase", async () => {
        await teardown()
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0,0.0)')
        const pid = resp.body.pid
        
        
        const resp1 = await request(app).put('/posts/updatePostByPID').send(`pid=${pid}`).send('imglink=tempLink')
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `post with pid ${pid} updated`)

        const resp2 = await request(app).get(`/posts/selectPost?pid=${pid}`)
        assert.deepStrictEqual(resp2.body.message, 
            [
                {
                    "pid": pid,
                    "uid": uid,
                    "imglink": "tempLink",
                    "datetime": null,
                    "coordinate": {"x":0.0, "y":0.0},
                    "activity": null,
                    "animalname": null,
                    "quantity": null
                }
            ]
        ) 
    })

    it("POST: update post with all", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        const uid2 = 'testUID2'
        await request(app).post('/users/createUser').send(`uid=${uid2}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send(`coordinate=(2.6, 7.5)`).send(`imgLink=test_link`)
        const pid = resp1.body.pid
        
        const resp2 = await request(app).put('/posts/updatePostByPID').send(`pid=${pid}`).send('imgLink=test_link').send('datetime=1997-12-17 07:37:16')
            .send(`uid=${uid2}`).send(`coordinate=(2.6, 7.5)`).send('animalName=John').send('quantity=34').send('activity=running')
        assert.strictEqual(resp2.status, 200)
        assert.strictEqual(resp2.body.message, `post with pid ${pid} updated`)

        const resp3 = await request(app).get(`/posts/selectPost?pid=${pid}`)
        assert.strictEqual(resp3.status, 200)
        assert.deepStrictEqual(resp3.body.message, 
            [
                {
                    "pid": pid,
                    "uid": uid2,
                    "imglink": "test_link",
                    "datetime": '1997-12-17T12:37:16.000Z',
                    "coordinate": {"x":2.6, "y":7.5},
                    "activity": 'running',
                    "animalname": 'John',
                    "quantity": 34
                }
            ]
        ) 
    })
})

describe("deleting posts", () => {
    it("POST: delete post by PID", async () => {
        await teardown()

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')
        const pid = resp1.body.pid

        const resp2 = await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)
        assert.strictEqual(resp2.body.message, `post with pid ${pid} deleted if existed`)
        assert.strictEqual(resp2.status, 200)

        const resp3 = await request(app).get(`/posts/selectPost?pid=${pid}`)
        assert.strictEqual(resp3.status, 200)
        assert.deepStrictEqual(resp3.body.message, [])
    })

    it("POST: delete post by ID where ID not listed", async () => {
        await teardown()
        const pid = '0123456701234567'
        const resp = await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, `post with pid ${pid} deleted if existed`)
    })

    it("POST: delete post by without id", async () => {
        await teardown()
        const resp = await request(app).delete('/posts/deletePostByPID')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `pid is required`)
    }) 
})