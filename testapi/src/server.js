const express = require('express');
require('dotenv').config();

const app = require('./app');
const server = express();
server.use('/',app);

server.listen(process.env.port, () =>{
 	console.log(`wildwhere server running on port ${process.env.port}`);
});