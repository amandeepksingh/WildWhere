//imports
const express = require('express');
const app = require('./app');
require('dotenv').config({path: "../../.env"});

if(process.env.location == "local") {
	console.log(`[server] Detected that you are running locally`);
} else {
	console.log(`[server] Detected that you are running on a server`);
}

//Creates server to listen. Sends requests from server to app
const server = express();
server.use(app);

//Server listens
server.listen(process.env.ec2port, () =>{ //server listens to calls
 	console.log(`[server] wildwhere server running on port ${process.env.ec2port}`);
});