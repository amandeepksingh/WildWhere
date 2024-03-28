//imports
const express = require('express')
const Pool = require('pg').Pool;
require('dotenv').config({path: "../.env"});

//creates DB connection
const pool = new Pool({
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
	ssl: {
		rejectUnauthorized:false
	}
});

//creates posts and routes methods and endpoints to functions
const posts = express();
posts.get('/selectPost', (req, res, next) => selectPost(req, res, next))
/*
    NOTE: if radius is entered into SELECT, then there must be a COORDINATE, 
    if a COORDINATE exists without a radius, assume radius of 0, filters for posts with this coordinates
        @params:
        pid int (optional),
        uid int (optional),
        radius int (optional), 
        imgLink string (optional),
        datetime string (optional),
        coordinate (float,float) (optional)
    @returns:
        message []{
            pid int,
            uid int,
            radius int,
            imgLink string,
            datetime string,
            coordinate [float,float]
        }
*/
posts.post('/createPost', (req, res, next) => createPost(req, res, next))
/*
    @params:
        pid int (required),
        uid int (required), //removed radius
        imgLink string (optional),
        datetime string (optional),
        coordinate (float,float) (optional)
    @returns:
        message string
            `post with pid ${testInput.pid} created`
            error message
*/
posts.put('/updatePostByPID', (req, res, next) => updatePostByPID(req, res, next))
/*
    @params:
        pid int (required),
        uid int (optional),
        imgLink string (optional),
        datetime string (optional),
        coordinate (float,float) (optional)
    @returns:
        message string
            `post with pid ${testInput.pid} updated`
            error message
*/
posts.delete('/deletePostByPID', (req, res, next) => deletePostByPID(req, res, next))
/*
    @params:
        pid int (required)
    @returns:
        message string:
            `post with pid ${pid} deleted if existed`
            error message
*/

/*
DOCUMENTATION:

*/

function selectPost(req, res, next) {
    var condits = []

    if (req.body.pid) condits.push(`pid = ${req.body.pid}`)
    if (req.body.uid) condits.push(`uid = ${req.body.uid}`)

    if (req.body.coordinate) {
        radius = req.body.radius ? req.body.radius : 0
        //RADIUS in MILES
        condits.push(`coordinate<@>point${req.body.coordinate} <= abs(${radius})`)
        //condits.push(`length('coordinate :: POINT, point(${req.body.coordinate}) :: POINT' :: PATH) <= abs(${radius})`)
        //condits.push(`\|((coordinate[0] - ${req.body.coordinate}[0]) ^ 2 + (coordinate[1] - ${req.body.coordinate}[1]) ^ 2)  <= abs(${radius})`) 
        //condits.push(`(@-@ path '(coordinate, ${req.body.coordinate})') <= abs(${radius})`)
    } else if (req.body.radius) return res.status(400).json({"message": "non-null search radius entered with null coordinates"})
    
    if (req.body.imgLink) condits.push(`imgLink = ${req.body.imgLink}`)

    //FRONT END CAN IMPLEMENT INTERVAL FUCTIONALITY IF THEY WISH TO
    if (req.body.starttime) condits.push(`TO_TIMESTAMP('${req.body.starttime}', 'YYYY/MM/DD/HH24:MI:ss') <= datetime`)
    if (req.body.endtime) condits.push(`datetime <= TO_TIMESTAMP('${req.body.endtime}', 'YYYY/MM/DD/HH24:MI:ss')`)

    vals = condits.join(' AND ')

    const query = condits.length == 0 ? `SELECT * FROM posts` : `SELECT * FROM posts WHERE ${vals}`

    return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            }) //propogate errors from DB up
        }
        return res.status(200).json({
            message: result.rows
        }) //expected return
    })
}

function createPost(req, res, next) {
    var dict = {}
    //does not require pid due to AUTO_INCREMENT
    if (req.body.uid) dict['uid'] = req.body.uid
    else return res.status(400).json({"message": "missing uid"}) //handles misformatted input
    if (req.body.imgLink) dict['imgLink'] = `'${req.body.imgLink}'` //s3 later on
    if (req.body.datetime) dict['datetime'] = `'${req.body.datetime}'` //check postgres
    if (req.body.coordinate) dict['coordinate'] = `point '${req.body.coordinate}'` // postgres: string with format '(x, y)' where x, y are floats
    else return res.status(400).json({"message": "missing coordinates"})

    const fields = Object.keys(dict).join(','),
        vals = Object.values(dict).join(',')
    const query = `INSERT INTO posts(${fields}) VALUES(${vals})`
    return pool.query(query, (error, result) => {
        if (error) {
            return res.status(400).json({
                "message": error.message
            })
        }
        return res.status(200).json({
            //could return the pid later
            message: `post created`
        })
    })
}

/*
    @params:
        pid int (required),
        uid int (optional),
        radius int (optional),
        imgLink string (optional),
        datetime string (optional),
        coordinate [float,float] (optional)
    @returns:
        message string
            `post with pid ${testInput.pid} updated`
            error message
*/

function updatePostByPID(req, res, next) {
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

    const len = Object.keys(updates).length
    if(len > 0) {
        const updateString = Object.keys(updates).map((col, i) => `${col} = $${i + 1}`).join(", ")
        const query = {
            text: `UPDATE posts SET ${updateString} WHERE pid = $${len + 1}`,
            values: Object.values(updates).concat([ req.body.pid ])
        }
        
        return pool.query(query, (error, result) => {
            if (error) {
                return res.status(400).json({
                    "message": error.message
                })
            }
            return res.status(200).json({
                message: `post updated`
            })
        })
    }
}

function deletePostByPID(req, res, next) {
    if (req.body.pid === undefined) {
        return res.status(400).json({
            "message": "missing pid"
        }) //handles misformatted input
    }

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
