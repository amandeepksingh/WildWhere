const fs = require('fs').promises;

function getHelpTxt() {
    /**
     *   @param:
     *       none
     *   @returns:
     *       helpTxt 
     */
    return fs.readFile('supportedEndsAndMeths.txt', { encoding: 'utf8' });
}

module.exports = getHelpTxt;