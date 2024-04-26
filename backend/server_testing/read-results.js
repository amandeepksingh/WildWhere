const fs = require('node:fs');
const { XMLParser } = require('fast-xml-parser');

fs.readFile('test-results.xml', 'utf8', (err, xml) => {
  if (err) {
    console.log(err);
    process.exit(2);
  }
  const parser = new XMLParser({ ignoreAttributes: false });
  const data = parser.parse(xml);
  const failures = data['testsuites']['@_failures'];
  if(failures === '0') {
    console.log(`read-results.js: all tests passed`);
    process.exit(0);
  }
  else {
    console.log(`read-results.js: ${failures} tests failed`);
    process.exit(1);
  }
});