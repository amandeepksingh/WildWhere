const fs = require('fs').promises;
const logger = require('./logger');

function getHelpTxt() {
    /**
     *   @param:
     *       none
     *   @returns:
     *       helpTxt 
     */
    // logger.log(`originalURL: ${JSON.stringify(req.originalUrl)} - body: ${JSON.stringify(req.body)} - headers: ${JSON.stringify(req.rawHeaders)}`)
    return fs.readFile('supportedEndsAndMeths.txt', { encoding: 'utf8' });
}

module.exports = getHelpTxt;