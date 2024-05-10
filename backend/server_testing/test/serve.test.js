const request = require('supertest');
const assert = require('assert');
const { describe } = require('node:test');
const http = require('http');

// server endpoint
const app = 'http://ec2-3-23-98-233.us-east-2.compute.amazonaws.com'

describe("select users", () => {
  it("USER: test select with ALL constraints", async () => {
    await request(app).post('/users/createUser').send(`uid=randomUID1`).send('email=jj@umass').send('username=John').send('bio=Student')
        .send('superUser=true').send('locationPerm=true').send('notificationPerm=true').send('colorBlindRating=10')
    // await request(app).post('/users/createUser').send(`uid=randomUID2`).send('email=jj@umass').send('username=John').send('bio=Student')
    //     .send('superUser=true').send('locationPerm=true').send('notificationPerm=true')
    // await request(app).post('/users/createUser').send(`uid=randomUID3`).send('email=jj@umass').send('username=John').send('bio=Student')
    //     .send('superUser=true').send('locationPerm=true').send('colorBlindRating=10')
    // await request(app).post('/users/createUser').send(`uid=randomUID4`).send('email=jj@umass').send('username=John').send('bio=Student')
    //     .send('superUser=true').send('notificationPerm=true').send('colorBlindRating=10')
    // await request(app).post('/users/createUser').send(`uid=randomUID5`).send('email=jj@umass').send('username=John').send('bio=Student')
    //     .send('locationPerm=true').send('notificationPerm=true').send('colorBlindRating=10')
    // await request(app).post('/users/createUser').send(`uid=randomUID6`).send('email=jj@umass').send('username=John')
    //     .send('superUser=true').send('locationPerm=true').send('notificationPerm=true').send('colorBlindRating=10')    
    // await request(app).post('/users/createUser').send(`uid=randomUID7`).send('email=jj@umass').send('bio=Student')
    //     .send('superUser=true').send('locationPerm=true').send('notificationPerm=true').send('colorBlindRating=10')
    // await request(app).post('/users/createUser').send('email=jj@umass').send('username=John').send('bio=Student')
    //     .send('superUser=true').send('locationPerm=true').send('notificationPerm=true').send('colorBlindRating=10')

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
            "colorblindrating": 10,
            "curloc": null,
            "deviceid": null

        }
    ])

   await request(app).delete(`/users/deleteUserByUID?uid=randomUID1`)

  });

  it("USER: test select with empty", async () => {

    const resp2 = await request(app).get(`/users/selectUser?uid=randomUID1`)
    assert.strictEqual(resp2.status,200)
    assert.deepStrictEqual(resp2.body.message, [])

  });

  it("USER: test select with no matching criteria", async () => {

    const uid = 'userID'
        await request(app).post('/users/createUser').send(`uid=${uid}`).send('email=jj@umass')

        const resp = await request(app)
        .get(`/users/selectUser?uid=${uid}&email=Notjj@umass`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [])

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)

  });

  it("USER: test select with with some constraints", async () => {

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
                "colorblindrating": null,
                "curloc": null,
                "deviceid": null
            }
        ])
        
        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/users/deleteUserByUID?uid=user2`)

  });

  it("USER: test select with many users", async () => {

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
                "colorblindrating": null,
                "curloc": null,
                "deviceid": null
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
                "colorblindrating": null,
                "curloc": null,
                "deviceid": null
            }
        ])

        await request(app).delete(`/users/deleteUserByUID?uid=${uid1}`)
        await request(app).delete(`/users/deleteUserByUID?uid=${uid2}`)
        await request(app).delete(`/users/deleteUserByUID?uid=${uid3}`)

  });



});

describe("creating users", () => {

    it("USER: test create", async () => {

        const uid = 'testUID'
        const resp = await request(app).post('/users/createUser').send(`uid=${uid}`)
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, `user created`)
        assert.strictEqual(resp.body.uid, uid)

        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        assert.strictEqual(respDel.status, 200)
    });
   
    it("USER: test create without uid", async () => {

        const resp = await request(app).post('/users/createUser')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `uid is required`)

    });

    it("USER: test create with all params", async () => {

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
            colorblindrating: 2,
                curloc: null,
                deviceid: null
        }]) 

        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=${testInput.uid}`)
        assert.strictEqual(respDel.status, 200)
    });

    it("USER: test create with camel case qualifiers", async () => {

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
            colorblindrating: 2,
            curloc: null,
            deviceid: null
        }]) 

        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=${testInput.uid}`)
        assert.strictEqual(respDel.status, 200)
    });

    it("USER: test create with lower case qualifiers", async () => {

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
            colorblindrating: 2,
            curloc: null,
            deviceid: null
        }])
        
        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=${testInput.uid}`);
        assert.strictEqual(respDel.status, 200);
    });

    it("USER: test create some but not all params", async () => {

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

        //MAY NOT WORK <----------------------------------------------------------------------------------------------------
        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=ffd             `)
        assert.strictEqual(respDel.status, 200)
    });
});

describe("updating users", () => {

    it("USER: update user with email", async () => {

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
                    "colorblindrating": null,
                    "curloc": null,
                    "deviceid": null
                }
            ]
        ) 

        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        assert.strictEqual(respDel.status, 200)

    });

    it("USER: update user, set field to empty string", async () => {

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
                    "colorblindrating": null,
                    "curloc": null,
                    "deviceid": null
                }
            ]
        )
        
        
        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        assert.strictEqual(respDel.status, 200)
    });
    
    it("USER: update user, update all fields", async () => {

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
                    "colorblindrating": 10,
                    "curloc": null,
                    "deviceid": null
                }
            ]
        ) 

       
        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        assert.strictEqual(respDel.status, 200)
    });

    it("USER: update user, update with camel case", async () => {

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
                    "colorblindrating": null,
                    "curloc": null,
                    "deviceid": null
                }
            ]
        )
        
        
        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        assert.strictEqual(respDel.status, 200)
    });

    it("USER: update user, update with lower case", async () => {

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
                    "colorblindrating": null,
                    "curloc": null,
                    "deviceid": null
                }
            ]
        ) 

       
        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`) 
        assert.strictEqual(respDel.status, 200)
    });

    it("USER: update user without updates", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp = await request(app).put('/users/updateUserByUID').send(`uid=${uid}`)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `at least one update is required`)

       
        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        assert.strictEqual(respDel.status, 200)
    });

    it("USER: update user without uid", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp = await request(app).put('/users/updateUserByUID')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `uid is required`)

       
        const respDel = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        assert.strictEqual(respDel.status, 200)
    });
   
   
   
});

describe("deleting users", () => {

    it("USER: delete user by ID", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        assert.strictEqual(resp1.status, 200)
        assert.strictEqual(resp1.body.message, `user with uid ${uid} deleted if existed`)

        const resp2 = await request(app).get(`/users/selectUser?uid=${uid}`)
        assert.deepStrictEqual(resp2.body.message, [])

    });
  
    it("USER: delete user by ID where ID not listed", async () => {
        const uid = 'testUID'
        const resp = await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, `user with uid ${uid} deleted if existed`)
    });

    it("USER: delete user by ID without uid", async () => {

        const resp = await request(app).delete('/users/deleteUserByUID')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `uid is required`)
    });
});

describe("selecting posts", () => {
    it("POST: test select with empty", async () => {
        const resp = await request(app).get('/posts/selectPost?coordinate=(0.0, 0.0)')

        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [])
    }); 

    it("POST: test select with too strict constraints", async () => {
        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)')
        assert.strictEqual(resp1.body.message, "post created")
        const pid = resp1.body.pid

        const resp2 = await request(app).get(`/posts/selectPost?pid=${pid}&animalName=bear`)
        assert.strictEqual(resp2.status, 200)
        assert.deepStrictEqual(resp2.body.message, [])

       
        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)

    }); 

    it("POST: test select with few constraints", async () => {
    
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
                "quantity": null,
                "state": null,
                "city": null
            }
        ])

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid}`) 

    }); 

    it("POST: test select with radius but no coord", async () => {

        const resp = await request(app)
        .get(`/posts/selectPost?pid=tempPid&radius=5`) //send body parameters
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "non-null search radius entered with null coordinates")

    }); 

    it("POST: test select with ALL constraints (minus datetime and radius)", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(2.5, 7.9)').send('animalName=John').send('quantity=8').send('activity=running')
            .send("state=Massachusetts").send("city=Amherst")
        const pid = resp1.body.pid

        const resp2 = await request(app)
        .get(`/posts/selectPost?pid=${pid}&uid=${uid}&coordinate=(2.5, 7.9)&quantity=8&activity=running&state=Massachusetts&city=Amherst`)
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
                "quantity": 8,
                "state": "Massachusetts",
                "city": "Amherst"
            }
        ])

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)  

    }); 

    it("POST: test select with multiple posts", async () => {

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
                "quantity": null,
                "state": null,
                "city": null
            },
            {
                "pid": pid2,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x": 2.6, "y": 7.5},
                "activity": null,
                "animalname": null,
                "quantity": null,
                "state": null,
                "city": null
            }
        ])

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid1}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid2}`)  

    }); 

    it("POST: null radius", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(177.0, 0.0)')
        const pid1 = resp1.body.pid

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
                "quantity": null,
                "state": null,
                "city": null
            }
        ])

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid1}`)

    }); 

    // it("POST: non-zero radius", async () => {

    //     const uid = 'testUID'
    //     await request(app).post('/users/createUser').send(`uid=${uid}`)

    //     const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(177.0, 0.0)')
    //     const pid1 = resp1.body.pid
    //     const resp2 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(50.0, 50.0)')
    //     const pid2 = resp2.body.pid
    //     const resp3 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(-0.5, 0.5)')
    //     const pid3 = resp3.body.pid
    //     const resp4 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(100.0, 0.0)')
    //     const pid4 = resp4.body.pid

    //     const resp = await request(app).get(`/posts/selectPost?radius=8000&coordinate=(177.0, 0.0)`)
    //     assert.strictEqual(resp.status,200)
    //     assert.deepStrictEqual(resp.body.message, [
    //         {
    //             "pid": pid1,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x":177.0, "y":0.0},
    //             "activity": null,
    //             "animalname": null,
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         },
    //         {
    //             "pid": pid2,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x":50.0, "y":50.0},
    //             "activity": null,
    //             "animalname": null,
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         },
    //         {
    //             "pid": pid4,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x":100.0, "y":0.0},
    //             "activity": null,
    //             "animalname": null,
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         }
    //     ])

    //     await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid1}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid2}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid3}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid4}`) 

    // }); 

    // it("POST: after a time", async () => {

    //     const uid = 'testUID'
    //     await request(app).post('/users/createUser').send(`uid=${uid}`)
        
    //     const resp4 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=1997-12-17 07:37:16').send('coordinate=(177.0, 0.0)')
    //     const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=2008-12-17 07:37:16').send('coordinate=(2.6, 0.0)')
    //     const pid = resp1.body.pid
        
    //     const resp2 = await request(app)
    //     .get(`/posts/selectPost?starttime=2000/12/17/07:37:16`)
    //     assert.strictEqual(resp2.status,200)
    //     assert.deepStrictEqual(resp2.body.message, [
    //         {
    //             "pid": pid,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": '2008-12-17T12:37:16.000Z',
    //             "coordinate": {"x": 2.6, "y": 0.0},
    //             "activity": null,
    //             "animalname": null,
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         }
    //     ])

    //     await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${resp4.body.pid}`)
    // }); 

    // it("POST: before a time", async () => {

    //     const uid = 'testUID'
    //     await request(app).post('/users/createUser').send(`uid=${uid}`)
        
    //     const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=1997-12-17 07:37:16').send('coordinate=(177.0, 0.0)')
    //     const pid1 = resp1.body.pid
    //     const resp4 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=2008-12-17 07:37:16').send('coordinate=(2.6, 0.0)')

    //     const resp = await request(app)
    //     .get(`/posts/selectPost?endtime=2000/12/17/07:37:16`)
    //     assert.strictEqual(resp.status,200)
    //     assert.deepStrictEqual(resp.body.message, [
    //         {
    //             "pid": pid1,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": '1997-12-17T12:37:16.000Z',
    //             "coordinate": {"x": 177.0, "y": 0.0},
    //             "activity": null,
    //             "animalname": null,
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         }
    //     ])

    //     await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid1}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${resp4.body.pid}`)

    // }); 

    // it("POST: between a time", async () => {

    //     const uid = 'testUID'
    //     await request(app).post('/users/createUser').send(`uid=${uid}`)
        
    //     const resp4 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=1997-12-17 07:37:16').send('coordinate=(177.0, 0.0)')
    //     const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=2008-12-17 07:37:16').send('coordinate=(2.6, 0.0)')
    //     const pid = resp1.body.pid
    //     const resp3 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=2010-12-17 07:37:16').send('coordinate=(2.6, 0.0)')
        
    //     const resp2 = await request(app)
    //     .get(`/posts/selectPost?starttime=2007/12/17/07:37:16&endtime=2009/12/17/07:37:16`)
    //     assert.strictEqual(resp2.status,200)
    //     assert.deepStrictEqual(resp2.body.message, [
    //         {
    //             "pid": pid,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": '2008-12-17T12:37:16.000Z',
    //             "coordinate": {"x": 2.6, "y": 0.0},
    //             "activity": null,
    //             "animalname": null,
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         }
    //     ])

    //     await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${resp3.body.pid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${resp4.body.pid}`)

    // }); 

    // it("POST: camel instead of lowercase times", async () => {

    //     const uid = 'testUID'
    //     await request(app).post('/users/createUser').send(`uid=${uid}`)
        
    //     const resp7 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('dateTime=1997-12-17 07:37:16').send('coordinate=(177.0, 0.0)')
    //     const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('dateTime=2008-12-17 07:37:16').send('coordinate=(2.6, 0.0)')
    //     const pid = resp1.body.pid
    //     const resp8 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('datetime=2010-12-17 07:37:16').send('coordinate=(2.6, 0.0)')
        
    //     const resp2 = await request(app).get(`/posts/selectPost?startTime=2007/12/17/07:37:16&endTime=2009/12/17/07:37:16`)
    //     assert.strictEqual(resp2.status,200)
    //     assert.deepStrictEqual(resp2.body.message, [
    //         {
    //             "pid": pid,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": '2008-12-17T12:37:16.000Z',
    //             "coordinate": {"x": 2.6, "y": 0.0},
    //             "activity": null,
    //             "animalname": null,
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         }
    //     ])


    //     await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${resp7.body.pid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${resp8.body.pid}`)

    // }); 

    // it("POST: lowercase animalName", async () => {

    //     const uid = 'testUID'
    //     await request(app).post('/users/createUser').send(`uid=${uid}`)
        
    //     const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('animalname=tyrone').send('coordinate=(177.0, 0.0)')
    //     const pid = resp1.body.pid

    //     const resp2 = await request(app).get('/posts/selectPost?animalname=tyrone')
    //     assert.strictEqual(resp2.status,200)
    //     assert.deepStrictEqual(resp2.body.message, [
    //         {
    //             "pid": pid,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x": 177.0, "y": 0.0},
    //             "activity": null,
    //             "animalname": 'tyrone',
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         }
    //     ])

    //     const resp3 = await request(app).get('/posts/selectPost?animalname=notTyrone')
    //     assert.strictEqual(resp3.status,200)
    //     assert.deepStrictEqual(resp3.body.message, [])

    //     await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)

    // }); 

    // it("POST: selecting with multiple animalNames", async () => {

    //     const uid = 'testUID'
    //     await request(app).post('/users/createUser').send(`uid=${uid}`)

    //     const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("animalName=w")
    //     const pid1 = resp1.body.pid
    //     const resp2 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("animalName=x")
    //     const pid2 = resp2.body.pid
    //     const resp3 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("animalName=y")
    //     const pid3 = resp3.body.pid
    //     const resp4 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("animalName=z")
    //     const pid4 = resp4.body.pid

    //     const resp = await request(app).get(`/posts/selectPost?animalName=x,y,z`)
    //     assert.strictEqual(resp.status,200)
    //     assert.deepStrictEqual(resp.body.message, [
    //         {
    //             "pid": pid2,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x":0.0, "y":0.0},
    //             "activity": null,
    //             "animalname": "x",
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         },
    //         {
    //             "pid": pid3,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x":0.0, "y":0.0},
    //             "activity": null,
    //             "animalname": "y",
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         },
    //         {
    //             "pid": pid4,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x":0.0, "y":0.0},
    //             "activity": null,
    //             "animalname": "z",
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         }
    //     ])

    //     await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid1}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid2}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid3}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid4}`)

    // }); 

    // it("POST: selecting with multiple quantities", async () => {

    //     const uid = 'testUID'
    //     await request(app).post('/users/createUser').send(`uid=${uid}`)

    //     const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("quantity=1")
    //     const pid1 = resp1.body.pid
    //     const resp2 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("quantity=2")
    //     const pid2 = resp2.body.pid
    //     const resp3 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("quantity=3")
    //     const pid3 = resp3.body.pid
    //     const resp4 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("quantity=4")
    //     const pid4 = resp4.body.pid

    //     const resp = await request(app).get(`/posts/selectPost?quantity=2,3`)
    //     assert.strictEqual(resp.status,200)
    //     assert.deepStrictEqual(resp.body.message, [
    //         {
    //             "pid": pid2,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x":0.0, "y":0.0},
    //             "activity": null,
    //             "animalname": null,
    //             "quantity": 2,
    //             "state": null,
    //             "city": null
    //         },
    //         {
    //             "pid": pid3,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x":0.0, "y":0.0},
    //             "activity": null,
    //             "animalname": null,
    //             "quantity": 3,
    //             "state": null,
    //             "city": null
    //         }
    //     ])


    //     await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid1}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid2}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid3}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid4}`)

    // }); 

    // it("POST: selecting with multiple activities", async () => {
        
    //     const uid = 'testUID'
    //     await request(app).post('/users/createUser').send(`uid=${uid}`)

    //     const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("activity=w")
    //     const pid1 = resp1.body.pid
    //     const resp2 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("activity=x")
    //     const pid2 = resp2.body.pid
    //     const resp3 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("activity=y")
    //     const pid3 = resp3.body.pid
    //     const resp4 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("activity=z")
    //     const pid4 = resp4.body.pid

    //     const resp = await request(app).get(`/posts/selectPost?activity=x,y,z`)
    //     assert.strictEqual(resp.status,200)
    //     assert.deepStrictEqual(resp.body.message, [
    //         {
    //             "pid": pid2,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x":0.0, "y":0.0},
    //             "activity": "x",
    //             "animalname": null,
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         },
    //         {
    //             "pid": pid3,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x":0.0, "y":0.0},
    //             "activity": "y",
    //             "animalname": null,
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         },
    //         {
    //             "pid": pid4,
    //             "uid": uid,
    //             "imglink": null,
    //             "datetime": null,
    //             "coordinate": {"x":0.0, "y":0.0},
    //             "activity": "z",
    //             "animalname": null,
    //             "quantity": null,
    //             "state": null,
    //             "city": null
    //         }
    //     ])

    //     await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid1}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid2}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid3}`)
    //     await request(app).delete(`/posts/deletePostByPID?pid=${pid4}`)

    // }); 

    it("POST: selecting with multiple states", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("state=w")
        const pid1 = resp1.body.pid
        const resp2 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("state=x")
        const pid2 = resp2.body.pid
        const resp3 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("state=y")
        const pid3 = resp3.body.pid
        const resp4 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("state=z")
        const pid4 = resp4.body.pid

        const resp = await request(app).get(`/posts/selectPost?state=x,y,z`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "pid": pid2,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x":0.0, "y":0.0},
                "activity": null,
                "animalname": null,
                "quantity": null,
                "state": "x",
                "city": null
            },
            {
                "pid": pid3,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x":0.0, "y":0.0},
                "activity": null,
                "animalname": null,
                "quantity": null,
                "state": "y",
                "city": null
            },
            {
                "pid": pid4,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x":0.0, "y":0.0},
                "activity": null,
                "animalname": null,
                "quantity": null,
                "state": "z",
                "city": null
            }
        ])

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid1}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid2}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid3}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid4}`)

    }); 

    it("POST: selecting with multiple cities", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("city=w")
        const pid1 = resp1.body.pid
        const resp2 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("city=x")
        const pid2 = resp2.body.pid
        const resp3 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("city=y")
        const pid3 = resp3.body.pid
        const resp4 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0, 0.0)').send("city=z")
        const pid4 = resp4.body.pid

        const resp = await request(app).get(`/posts/selectPost?city=x,y,z`)
        assert.strictEqual(resp.status,200)
        assert.deepStrictEqual(resp.body.message, [
            {
                "pid": pid2,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x":0.0, "y":0.0},
                "activity": null,
                "animalname": null,
                "quantity": null,
                "state": null,
                "city": "x"
            },
            {
                "pid": pid3,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x":0.0, "y":0.0},
                "activity": null,
                "animalname": null,
                "quantity": null,
                "state": null,
                "city": "y"
            },
            {
                "pid": pid4,
                "uid": uid,
                "imglink": null,
                "datetime": null,
                "coordinate": {"x":0.0, "y":0.0},
                "activity": null,
                "animalname": null,
                "quantity": null,
                "state": null,
                "city": "z"
            }
        ])

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid1}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid2}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid3}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid4}`)

    }); 

});

describe("creating posts", () => {
    
    it("POST: test create without uid", async () => {

        const resp = await request(app).post('/posts/createPost').send('coordinate=(0.5, 0.5)')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "uid is required")

    });
    
    it("POST: test create without coordinates", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send('uid=${uid}')

        const resp = await request(app).post('/posts/createPost').send(`uid=${uid}`)
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, "coordinate is required")

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)

    }); 

    it("POST: test create with only uid and coordinates", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp = await request(app).post('/posts/createPost').send(`uid=${uid}`).send(`coordinate=(2.6, 7.5)`)
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, "post created")

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${resp.body.pid}`)

    }); 

    it("POST: test create post with all params", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        
        const resp = await request(app).post('/posts/createPost').send(`uid=${uid}`).send(`imgLink=test_link`).send(`datetime=1999-01-08 04:05:06`)
            .send(`coordinate=(2.6, 7.5)`).send(`quantity=2`).send(`activity=running`).send("state=Massachusetts").send("city=Amherst")
        assert.strictEqual(resp.body.message, `post created`)
        assert.strictEqual(resp.status, 200)

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${resp.body.pid}`)

    }); 

    it("POST: test create with some but not all params", async () => {

        const uid = 'testUID'
    await request(app).post('/users/createUser').send(`uid=${uid}`)

    const resp = await request(app).post('/posts/createPost').send(`uid=${uid}`).send(`imglink=test_link`).send(`coordinate=(0.0,0.0)`)
    assert.strictEqual(resp.body.message, `post created`)
    assert.strictEqual(resp.status, 200)

    await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
    await request(app).delete(`/posts/deletePostByPID?pid=${resp.body.pid}`)

    }); 

});

describe("updating posts", () => {

    it("POST: update post with imgLink", async () => {

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
                    "quantity": null,
                    "state": null,
                    "city": null
                }
            ]
        )
        
        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
    await request(app).delete(`/posts/deletePostByPID?pid=${resp1.body.pid}`)

    });
    
    it("POST: update post with empty imgLink", async () => {
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
                    "quantity": null,
                    "state": null,
                    "city": null
                }
            ]
        ) 

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)
         

    });

    it("POST: update post without pid", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp = await request(app).put('/posts/updatePostByPID').send('imgLink=test_link')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `pid is required`)


        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)

    });

    it("POST: update post without updates", async () => {

        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send('coordinate=(0.0,0.0)')
        const pid = resp1.body.pid
        
        const resp2 = await request(app).put('/posts/updatePostByPID').send(`pid=${pid}`)
        assert.strictEqual(resp2.status, 400)
        assert.strictEqual(resp2.body.message, `at least one update is required`)


        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)

    });

    it("POST: update post, update with camelcase", async () => {

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
                    "quantity": null,
                    "state": null,
                    "city": null
                }
            ]
        ) 

        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)


    });

    it("POST: update post, update with lowercase", async () => {
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
                    "quantity": null,
                    "state": null,
                    "city": null
                }
            ]
        ) 
        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)    });

    it("POST: update post with all", async () => {


        const uid = 'testUID'
        await request(app).post('/users/createUser').send(`uid=${uid}`)
        const uid2 = 'testUID2'
        await request(app).post('/users/createUser').send(`uid=${uid2}`)

        const resp1 = await request(app).post('/posts/createPost').send(`uid=${uid}`).send(`coordinate=(2.6, 7.5)`).send(`imgLink=test_link`)
        const pid = resp1.body.pid
        
        const resp2 = await request(app).put('/posts/updatePostByPID').send(`pid=${pid}`).send('imgLink=test_link').send('datetime=1997-12-17 07:37:16')
            .send(`uid=${uid2}`).send(`coordinate=(2.6, 7.5)`).send('animalName=John').send('quantity=34').send('activity=running')
            .send("state=Massachusetts").send("city=Amherst")
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
                    "datetime": '1997-12-17T07:37:16.000Z',
                    "coordinate": {"x":2.6, "y":7.5},
                   "activity": 'running',
                    "animalname": 'John',
                    "quantity": 34,
                    "state": "Massachusetts",
                    "city": "Amherst"
                }
            ]
        )
        
        await request(app).delete(`/users/deleteUserByUID?uid=${uid}`)
        await request(app).delete(`/users/deleteUserByUID?uid=${uid2}`)
        await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)  

    });
   
});

describe("deleting posts", () => {

    it("POST: delete post by PID", async () => {

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

    });

    it("POST: delete post by PID where PID not listed", async () => {

        const pid = '0123456701234567'
        const resp = await request(app).delete(`/posts/deletePostByPID?pid=${pid}`)
        assert.strictEqual(resp.status, 200)
        assert.strictEqual(resp.body.message, `post with pid ${pid} deleted if existed`)

    });


    it("POST: delete post without PID", async () => {

        const resp = await request(app).delete('/posts/deletePostByPID')
        assert.strictEqual(resp.status, 400)
        assert.strictEqual(resp.body.message, `pid is required`)

    });
});

//TODO add report tests here as well