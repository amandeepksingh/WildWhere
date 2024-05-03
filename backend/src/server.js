//imports
const express = require('express');
const app = require('./app');
const fs = require('fs');
require('dotenv').config({path: "../../.env"});


console.log(process.env.location);
if(process.env.location == "local") {
	console.log(`[server] Detected that you are running locally`);
} else {
	console.log(`[server] Detected that you are running on a server`);

	//write pid to a file
	const pidnum = `${process.pid}`;
	fs.writeFile("pid.txt", pidnum, (err) => {
	if(err) {
		console.log("error writing pid to file");
		return;
	}
		console.log("wrote pid to pid file");
	});

}

//Creates server to listen. Sends requests from server to app
const server = express();
server.use(app);

//Server listens
server.listen(process.env.ec2port, () => {
 	console.log(`[server] wildwhere server running on port ${process.env.ec2port}`);
});