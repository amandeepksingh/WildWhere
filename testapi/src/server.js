//imports
const express = require('express');
const app = require('./app');

//Creates server to listen. Sends requests from server to app
const server = express();
server.use('/',app);

//Server listens
server.listen(process.env.port, () =>{ //server listens to calls
 	console.log(`wildwhere server running on port ${process.env.port}`);
});