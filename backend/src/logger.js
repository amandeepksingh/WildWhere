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
    
    static logRequest(req) {
        logger.log(errorCodes.INFO, `REQUEST: url=${JSON.stringify(req.originalUrl)}, query=${JSON.stringify(req.query)}, body=${JSON.stringify(req.body)}, headers=${JSON.stringify(req.rawHeaders)}`)
    }
    static logQuery(query) {
        logger.log(errorCodes.INFO, `QUERY: query=${JSON.stringify(query)}`)
    }
    static logDBfail(error) {
        logger.log(errorCodes.FATAL, `DB FAILURE: error=${JSON.stringify(error.message)}`)
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
}

module.exports = logger