//imports
const express = require('express')
const Pool = require('pg').Pool;
const logger = require('./logger');
require('dotenv').config({path: "../.env"});
const randomstring = require('randomstring');
const {s3Helpers, images} = require('./images');
const AWSs3Module = require('@aws-sdk/client-s3');
const AWSPreSigner = require('@aws-sdk/s3-request-presigner');

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
    var responseStatus, responseJson
    logger.logRequest(req);
    //parse req query into params and values
    var rawConditions = []
    var values = []
    var i = 1
    if (req.query.pid !== undefined) {
        rawConditions.push(`pid = $${i++}`)
        values.push(req.query.pid)
    }
    if (req.query.uid !== undefined) {
        rawConditions.push(`uid = $${i++}`)
        values.push(req.query.uid)
    }
    if (req.query.coordinate !== undefined) {
        radius = req.query.radius ? req.query.radius : 0 //if a COORDINATE exists without a radius, assume radius of 0, filters for posts with this coordinates
        rawConditions.push(`coordinate<@>$${i++}::point <= abs($${i++})`)
        values.push(req.query.coordinate)
        values.push(radius)
    } else if (req.query.radius !== undefined) { //note that req.query.coordinate === undefined
        logger.logInvalidInput("non-null search radius entered with null coordinates")
        responseStatus = 400
        responseJson = {message: "non-null search radius entered with null coordinates"}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson); 
    }
    if (req.query.starttime !== undefined) {
        rawConditions.push(`TO_TIMESTAMP($${i++}, 'YYYY/MM/DD/HH24:MI:ss') <= datetime`)
        values.push(req.query.starttime)
    } else if (req.query.startTime !== undefined) {
        rawConditions.push(`TO_TIMESTAMP($${i++}, 'YYYY/MM/DD/HH24:MI:ss') <= datetime`)
        values.push(req.query.startTime)
    }
    if (req.query.endtime !== undefined) {
        rawConditions.push(`datetime <= TO_TIMESTAMP($${i++}, 'YYYY/MM/DD/HH24:MI:ss')`)
        values.push(req.query.endtime)
    } else if (req.query.endTime !== undefined) {
        rawConditions.push(`datetime <= TO_TIMESTAMP($${i++}, 'YYYY/MM/DD/HH24:MI:ss')`)
        values.push(req.query.endTime)
    }
    if (req.query.animalname !== undefined) {
        rawConditions.push(`animalname = $${i++}`)
        values.push(req.query.animalname)
    } else if (req.query.animalName) {
        rawConditions.push(`animalname = $${i++}`)
        values.push(req.query.animalName)
    }
    if (req.query.quantity !== undefined) {
        rawConditions.push(`quantity = $${i++}`)
        values.push(req.query.quantity)
    }
    if (req.query.activity !== undefined) {
        rawConditions.push(`activity = $${i++}`)
        values.push(req.query.activity)
    }
    const conditionsAsString = rawConditions.join(' AND ')
    const query = rawConditions.length === 0 ? "SELECT * FROM posts" : {
        text: `SELECT * FROM posts WHERE ${conditionsAsString}`,
        values: values
    }

    logger.logQuery(query)
    // run a s3 request to get the signed URL
    const ret = pool.query(query, async (error, result) => {
        if (error) {
            logger.logDBerr(error);
            responseStatus = 400
            responseJson = {message: error.message}
            logger.logResponse(responseStatus, responseJson)
            return res.status(responseStatus).json(responseJson)
        }
        logger.logDBsucc(result);
        responseStatus = 200
        
        logger.logResponse(responseStatus);
        //respObj = JSON.parse(result.rows[0]);
        //console.log(result.rows)

        if(result.rows && result.rows.length > 0) {
            //request a new signedurl
            for(let i = 0; i < result.rows.length; ++i) {
                //console.log("row: " + i + " " + result.rows[i].imglink)
                if(result.rows[i].imglink != null) {
                    const toks = result.rows[i].imglink.split("/");
                    //console.log(toks);
                    if(toks.length === 3) {
                        const url = await s3Helpers.s3GetSignedURL(toks[0], toks[1], toks[2]);
                        //console.log(url)
                        result.rows[i].imglink = url;
                    }
                }
                //console.log("------")
            }
  
        }
        responseJson = {message: result.rows}
        //get signed url for the 
        //console.log(responseJson);

        return res.status(200).json(responseJson)
    })
    
    return ret;
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
    logger.logRequest(req)
    
    //parse valid elements of req.body into params array
    const params = []
    params['pid'] = randomstring.generate(16)
    if (req.body.uid !== undefined) {
        params['uid'] = req.body.uid
    } else {
        logger.logInvalidInput("uid is required")
        responseStatus = 400
        responseJson = {message: "uid is required"}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }
    if (req.body.imgLink !== undefined) {
        params['imgLink'] = req.body.imgLink
    } else if (req.body.imglink !== undefined) {
        params['imgLink'] = req.body.imglink
    }
    if (req.body.datetime !== undefined) {
        params['datetime'] = req.body.datetime
    } else if (req.body.dateTime !== undefined) {
        params['datetime'] = req.body.dateTime
    }
    if (req.body.coordinate !== undefined) {
        params['coordinate'] = req.body.coordinate
    } else {
        logger.logInvalidInput("coordinate is required")
        responseStatus = 400
        responseJson = {message: "coordinate is required"}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }
    if (req.body.animalName !== undefined) {
        params['animalName'] = req.body.animalName
    } else if (req.body.animalname !== undefined) {
        params['animalName'] = req.body.animalname
    }
    if (req.body.quantity !== undefined) {
        params['quantity'] = req.body.quantity
    }
    if (req.body.activity !== undefined) {
        params['activity'] = req.body.activity
    }
    if (req.body.state !== undefined) {
        params['state'] = req.body.state
    }
    if (req.body.city !== undefined) {
        params['city'] = req.body.city
    }

    //parse params array into db query
    const paramsAsString = Object.keys(params).join(', ')
    const placeholders = Object.keys(params).map((_, i) => `$${i + 1}`).join(', ')
    const query = {
        text: `INSERT INTO posts(${paramsAsString}) VALUES(${placeholders})`,
        values: Object.values(params)
    }
    logger.logQuery(query)

    // send db query and return response
    return pool.query(query, (error, result) => {
        if (error) {
            logger.logDBfail(error)
            responseStatus = 400
            responseJson = {message: error.message}
            logger.logResponse(responseStatus, responseJson)
            return res.status(responseStatus).json(responseJson)
        }
        logger.logDBsucc(result)
        responseStatus = 200
        responseJson = {message: "post created", pid: params['pid']}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
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
    var responseStatus, responseJson
    logger.logRequest(req)

    //parse valid elements of req.body into columns array
    const columns = ["uid", "imgLink", "datetime", "coordinate", "animalName", "quantity", "activity", "state", "city"]
    var params = {}
    for(const col of columns) {
        if(req.body[col] !== undefined) {
            params[col] = req.body[col]
        } else if (req.body[col.toLowerCase()] !== undefined) {
            params[col] = req.body[col.toLowerCase()]
        }
    }
    //check that req contains required pid
    if(req.body.pid === undefined) {
        responseStatus = 400
        responseJson = {message: "pid is required"}
        logger.logInvalidInput(responseJson.message)
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }
    //check that there is at least one update
    if (Object.keys(params).length == 0) {
        logger.logInvalidInput("at least one update is required")
        responseStatus = 400
        responseJson = {message: "at least one update is required"}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }
    //parse columns array into db query
    const paramsAsString = Object.keys(params).map((col, i) => `${col} = $${i + 1}`).join(", ")
    const query = {
        text: `UPDATE posts SET ${paramsAsString} WHERE pid = $${Object.keys(params).length + 1}`,
        values: Object.values(params).concat([ req.body.pid ])
    }
    logger.logQuery(query)

    //send db query and return response
    return pool.query(query, (error, result) => {
        if (error) {
            logger.logDBfail(error)
            responseStatus = 400
            responseJson = {message: error.message}
            logger.logResponse(responseStatus, responseJson)
            return res.status(responseStatus).json(responseJson)
        }
        logger.logDBsucc(result)
        responseStatus = 200
        responseJson = {message: `post with pid ${req.body.pid} updated`}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    })
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
    var responseStatus, responseJson
    logger.logRequest(req)

    //check that req contains required pid
    if(req.query.pid === undefined) {
        responseStatus = 400
        responseJson = {message: "pid is required"}
        logger.logInvalidInput(responseJson.message)
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    }
    //create db query
    const query = {
        text: "DELETE FROM posts WHERE pid = $1",
        values: [req.query.pid]
    }
    logger.logQuery(query)

    //send query to db and return response
    return pool.query(query, (error, result) => {
        if (error) {
            logger.logDBfail(error)
            responseStatus = 400
            responseJson = {message: error.message}
            logger.logResponse(responseStatus, responseJson)
            return res.status(responseStatus).json(responseJson)
        }
        logger.logDBsucc(result)
        responseStatus = 200
        responseJson = {message: `post with pid ${req.query.pid} deleted if existed`}
        logger.logResponse(responseStatus, responseJson)
        return res.status(responseStatus).json(responseJson)
    })
}

//exports posts to app
module.exports = posts;
