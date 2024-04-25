const fs = require('fs').promises;
const { error } = require('console');
const logger = require('./logger');

function getHelpTxt(url, body, headers) {
    /**
     *   @param:
     *       none
     *   @returns:
     *       helpTxt 
     */
    logger.logBadEndpoint(url, body, headers)
    return fs.readFile('supportedEndsAndMeths.txt', { encoding: 'utf8' });
}

module.exports = getHelpTxt;