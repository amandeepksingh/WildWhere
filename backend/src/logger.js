const fs = require('fs');
var path = require('path');

class logger {
    static requestLogStream;
    static generalLogStream;

    constructor() {
        logger.requestLogStream = fs.createWriteStream(path.join(__dirname, '../../requests.log'), { flags: 'a' });
        logger.generalLogStream = fs.createWriteStream(path.join(__dirname, '../../general.log'), { flags: 'a' });
    }

    static log(logMessage) {
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
        logger.generalLogStream.write(datetime + " - " + logMessage + "\n");
    }
}

module.exports = logger