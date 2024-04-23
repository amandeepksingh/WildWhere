const fs = require('fs').promises;
const logger = require('./logger');

function getHelpTxt(url, body, headers) {
    /**
     *   @param:
     *       none
     *   @returns:
     *       helpTxt 
     */
    logger.log(`originalURL: ${JSON.stringify(url)} - body: ${JSON.stringify(body)} - headers: ${JSON.stringify(headers)}`)
    return fs.readFile('supportedEndsAndMeths.txt', { encoding: 'utf8' });
}

module.exports = getHelpTxt;