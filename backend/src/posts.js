//imports
const express = require('express')
const Pool = require('pg').Pool;
const logger = require('./logger');
require('dotenv').config({path: "../.env"});
const randomstring = require('randomstring');

//creates DB connection
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


//creates posts and routes methods and endpoints to functions
const posts = express();
posts.get('/selectPost', (req, res, next) => selectPost(req, res, next))
posts.post('/createPost', (req, res, next) => createPost(req, res, next))
posts.put('/updatePostByPID', (req, res, next) => updatePostByPID(req, res, next))
posts.delete('/deletePostByPID', (req, res, next) => deletePostByPID(req, res, next))

function selectPost(req, res, next) {
    /**
     * @param:
     *  pid string (optional),
     *  uid string (optional),
     *  radius int (optional), 
     *  imgLink string (optional),
     *  starttime string (optional),
     *  endtime string (optional),
     *  coordinate (float,float) (optional)
     *  animalName string (optional)
     *  quantity int (optional)
     *  activity string (optional)
     * @returns:
     *   message []{
     *      pid string,
     *      uid string,
     *      radius int,
     *      imgLink string,
     *      datetime string,
     *      coordinate (x: float, y: float),
     *      animalName string,
     *      quantity int,
     *      activity string
     *  }
     */
    logger.log(`originalURL: ${JSON.stringify(req.originalUrl)} - body: ${JSON.stringify(req.body)} - headers: ${JSON.stringify(req.rawHeaders)}`)
    var condits = []
    var values = []
    var i = 1

    if (req.query.pid) {
        condits.push(`pid = $${i++}`)
        values.push(req.query.pid)
    }
    if (req.query.uid) {
        condits.push(`uid = $${i++}`)
        values.push(req.query.uid)
    }

    if (req.query.coordinate) {
        radius = req.query.radius ? req.query.radius : 0 //if a COORDINATE exists without a radius, assume radius of 0, filters for posts with this coordinates
        //RADIUS in MILES
        condits.push(`coordinate<@>$${i++}::point <= abs($${i++})`)
        values.push(req.query.coordinate)
        values.push(radius)
        //condits.push(`length('coordinate :: POINT, point(${req.body.coordinate}) :: POINT' :: PATH) <= abs(${radius})`)
        //condits.push(`\|((coordinate[0] - ${req.body.coordinate}[0]) ^ 2 + (coordinate[1] - ${req.body.coordinate}[1]) ^ 2)  <= abs(${radius})`) 
        //condits.push(`(@-@ path '(coordinate, ${req.body.coordinate})') <= abs(${radius})`)
    } else if (req.query.radius) return res.status(400).json({"message": "non-null search radius entered with null coordinates"}); //if radius is entered into SELECT, then there must be a COORDINATE
    
    if (req.query.imgLink) {
        condits.push(`imgLink = $${i++}`)
        values.push(req.query.imgLink)
    }

    //FRONT END CAN IMPLEMENT INTERVAL FUCTIONALITY IF THEY WISH TO
    if (req.query.starttime) {
        condits.push(`TO_TIMESTAMP($${i++}, 'YYYY/MM/DD/HH24:MI:ss') <= datetime`)
        values.push(req.query.starttime)
    }
    if (req.query.endtime) {
        condits.push(`datetime <= TO_TIMESTAMP($${i++}, 'YYYY/MM/DD/HH24:MI:ss')`)
        values.push(req.query.endtime)
    }
    if (req.query.animalName) {
        condits.push(`animalName = $${i++}`)
        values.push(req.query.animalName)
    }
    if (req.query.quantity) {
        condits.push(`quantity = $${i++}`)
        values.push(req.query.quantity)
    }
    if (req.query.activity) {
        condits.push(`activity = $${i++}`)
        values.push(req.query.activity)
    }

    const query = condits.length === 0 ? "SELECT * FROM posts" : {
            text: `SELECT * FROM posts WHERE ${condits.join(' AND ')}`,
            values: values
        }

    logger.log(`query: ${JSON.stringify(query)}`);
    return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            }); //propogate errors from DB up
        }
        
        return res.status(200).json({
            message: result.rows
        }); //expected return
    })
}

function createPost(req, res, next) {
    /**
     * @param:
     *  uid string (required),
     *  imgLink string (optional),
     *  datetime string (optional),
     *  coordinate (float,float) (required),
     *  animalName string (optional),
     *  quantity int (optional),
     *  activity string (optional)
     * @returns:
     *  message string
     *      "post created"
     *      OR
     *      error message
     *  pid string (on success)
    */
    logger.log(`originalURL: ${JSON.stringify(req.originalUrl)} - body: ${JSON.stringify(req.body)} - headers: ${JSON.stringify(req.rawHeaders)}`)
    var dict = {}
    //NO PID (randomly generated)
    if (req.body.uid) dict['uid'] = req.body.uid
    else return res.status(400).json({"message": "missing uid"}) //handles misformatted input
    if (req.body.imgLink) dict['imgLink'] = req.body.imgLink //s3 later on
    if (req.body.datetime) dict['datetime'] = req.body.datetime //check postgres
    if (req.body.coordinate) dict['coordinate'] = req.body.coordinate // postgres: string with format '(x, y)' where x, y are floats
    else return res.status(400).json({"message": "missing coordinates"})
    if (req.body.animalName) dict['animalName'] = req.body.animalName
    if (req.body.quantity) dict['quantity'] = req.body.quantity
    if (req.body.activity) dict['activity'] = req.body.activity

    const pid = randomstring.generate(16)
    dict['pid'] = pid

    const fields = Object.keys(dict).join(', ')
    const placeholders = Object.keys(dict).map((_, i) => `$${i + 1}`).join(', ')
    const query = {
        text: `INSERT INTO posts(${fields}) VALUES(${placeholders})`,
        values: Object.values(dict)
    }

    logger.log(`query: ${JSON.stringify(query)}`)
    return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            })
        }
        return res.status(200).json({
            message: "post created",
            pid: pid
        })
    })
}

function updatePostByPID(req, res, next) {
    /**
     * @param:
     *  pid string (required),
     *  uid string (optional),
     *  imgLink string (optional),
     *  datetime string (optional),
     *  coordinate (float,float) (optional),
     *  animalName string (optional),
     *  quantity int (optional),
     *  activity string (optional)
     * @returns:
     *  message string
     *      `post with pid ${pid} updated`
     *      OR
     *      error message
     */
    logger.log(`originalURL: ${JSON.stringify(req.originalUrl)} - body: ${JSON.stringify(req.body)} - headers: ${JSON.stringify(req.rawHeaders)}`)
    if (req.body.pid === undefined) {
        return res.status(400).json({
            "message": "missing pid"
        }) //handles misformatted input
    }

    const updates = {}
    if (req.body.uid) updates["uid"] = req.body.uid
    if (req.body.imgLink) updates["imgLink"] = req.body.imgLink
    if (req.body.datetime) updates["datetime"] = req.body.datetime //check postgres format
    if (req.body.coordinate) updates["coordinate"] = req.body.coordinate //check postgres format
    if (req.body.animalName) updates['animalName'] = req.body.animalName
    if (req.body.quantity) updates['quantity'] = req.body.quantity
    if (req.body.activity) updates['activity'] = req.body.activity

    const len = Object.keys(updates).length
    if(len > 0) {
        const updateString = Object.keys(updates).map((col, i) => `${col} = $${i + 1}`).join(", ")
        const query = {
            text: `UPDATE posts SET ${updateString} WHERE pid = $${len + 1}`,
            values: Object.values(updates).concat([ req.body.pid ])
        }
        
    logger.log(`query: ${JSON.stringify(query)}`)
        return pool.query(query, (error, result) => {
            if (error) {
                return res.status(400).json({
                    "message": error.message
                })
            }
            return res.status(200).json({
                message: `post with pid ${req.body.pid} updated`
            })
        })
    }
}

function deletePostByPID(req, res, next) {
    /**
     *   @param:
     *      pid string (required)
     *   @returns:
     *       message string:
     *           `post with pid ${pid} deleted if existed`
     *           OR
     *           error message
     */
    logger.log(`originalURL: ${JSON.stringify(req.originalUrl)} - body: ${JSON.stringify(req.body)} - headers: ${JSON.stringify(req.rawHeaders)}`)
    if (req.body.pid === undefined) {
        return res.status(400).json({
            "message": "missing pid"
        }) //handles misformatted input
    }

    logger.log(`query: DELETE FROM posts WHERE pid = $1 - vals: ${[req.body.pid]}`)
    return pool.query("DELETE FROM posts WHERE pid = $1", [req.body.pid], (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            })
        }
        return res.status(200).json({
            message: `post with pid ${req.body.pid} deleted if existed`
        })
    })
}

//exports posts to app
module.exports = posts;
