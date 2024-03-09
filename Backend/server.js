const http = require('http');
const port = process.env.port || 3000; //goes to localhost:3000 if not defined

const app = require('./api/app');

const server = http.createServer(app);

server.listen(port);