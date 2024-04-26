//imports
const fs = require('fs');
var path = require('path');

//errorCodes
const errorCodes = {
    FATAL: "FATAL",
    ERROR: "ERROR",
    INFO: "INFO"
}

class logger {
    static requestLogStream;
    static generalLogStream;

    constructor() {
        logger.requestLogStream = fs.createWriteStream(path.join(__dirname, '../../requests.log'), { flags: 'a' });
        logger.generalLogStream = fs.createWriteStream(path.join(__dirname, '../../general.log'), { flags: 'a' });
    }

    static log(errorCode, logMessage) {
        /**
         * Creates an entry in the logs/general.log file with timestamp
         */
        const currentdate = new Date(); 
        const datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
        logger.generalLogStream.write(`${errorCode}; ${datetime}; ${logMessage}\n`);
    }
    
    static logBadEndpoint(url, body, headers) {
        logger.log(errorCodes.ERROR,`BAD ENDPOINT: originalURL=${JSON.stringify(url)} - body=${JSON.stringify(body)} - headers=${JSON.stringify(headers)}`)
    }
    static logRequest(req) {
        logger.log(errorCodes.INFO, `REQUEST: url=${JSON.stringify(req.originalUrl)}, query=${JSON.stringify(req.query)}, body=${JSON.stringify(req.body)}, headers=${JSON.stringify(req.rawHeaders)}`)
    }
    static logQuery(query) {
        logger.log(errorCodes.INFO, `QUERY: query=${JSON.stringify(query)}`)
    }
    static logDBfail(error) {
        logger.log(errorCodes.ERROR, `DB FAILURE: error=${JSON.stringify(error.message)}`)
    }
    static logDBsucc(result) {
        logger.log(errorCodes.INFO, `DB SUCCESS: rowCount=${JSON.stringify(result.rowCount)}, rows=${JSON.stringify(result.rows)}`)
    }
    static logInvalidInput(message) {
        logger.log(errorCodes.ERROR, `INVALID INPUT: message=${message}`)
    }
    static logResponse(status, json) {
        logger.log(errorCodes.INFO, `RESPONSE: status=${status}, json=${JSON.stringify(json)}`)
    }
    static logInternalError(message) {
        logger.log(errorCodes.FATAL, `INTERNAL ERROR: message=${message}`)
    }
    static logImgPathsParsed(localPath, uploadPath) {
        logger.log(errorCodes.INFO, `IMAGE PATHS PARSED: localPath=${localPath}, uploadPath=${uploadPath}`)
    }
    static logAlreadyInS3(type, id, inS3) {
        if (inS3) logger.log(errorCodes.INFO, `ALREADY IN S3 CHECK: ${type.substring(0, type.length - 1)} with id=${id} already in s3`)
        else logger.log(errorCodes.INFO, `ALREADY IN S3 CHECK: ${type.substring(0,type.length - 1)} with id=${id} not already in s3`)
    }
    static logS3Req(method, params) {
        logger.log(errorCodes.INFO, `S3 REQ ${method}, params=${JSON.stringify(params)}`)
    }
    static logS3PutResp(respStatus) {
        logger.log(errorCodes.INFO, `S3 RESP PUT: returned with status=${respStatus}`)
    }
    static logS3Contents(path, contents) {
        logger.log(errorCodes.INFO, `S3 RESP CONTENTS: path=${path}, contents=${contents}`)
    }
    static logS3URL(url) {
        logger.log(errorCodes.INFO, `S3 RESP URL: url=${url}`)
    }
    static logS3Delete(respStatus) {
        logger.log(errorCodes.INFO, `S3 RESP DELETE: returned with status=${respStatus}`)
    }
}

module.exports = logger