//imports
const express = require('express');
const app = require('./app');
require('dotenv').config({path: "../../.env"});

//Creates server to listen. Sends requests from server to app
const server = express();
server.use(app);

//Server listens
server.listen(process.env.ec2port, () =>{ //server listens to calls
 	console.log(`wildwhere server running on port ${process.env.ec2port}`);
});