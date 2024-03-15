const express = require('express');
const env = require('dotenv').config();

const port = process.env.port || 80; //goes to localhost:80 if not defined
const db = require('./db');

const app = express();

app.get('/', (req, res) =>{
	res.send("hi");
});
app.use('/',db);
//const server = http.createServer(db);

//app.listen()

// const http = require('http');
// const url = require('url');

// const server = http.createServer((req, res) => {
// 	console.log("url recieved:" + req.url);
// 	const parsed_url = url.parse(req.url, true);
// 	const {name} = parsed_url.query;

// 	res.writeHead(200, {'Content-Type': 'text-plain'});

// 	if(name) {
// 		res.end(`welcome to the wildwhere server ${name}\n`); 
// 	} else {
// 		res.end('do you have no name?');
// 	}
	
// });

app.listen(port, () =>{
 	console.log(`wildwhere server running on port ${port}`);

});
// server.listen(port,'0.0.0.0', () =>{
/// });
