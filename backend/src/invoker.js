const logger = require('./logger');
require('dotenv').config({path: "../.env"});
const {LambdaClient, InvokeCommand} =  require("@aws-sdk/client-lambda");

//config
const config = {
    credentials: {
        accessKeyId: process.env.accessKeyID,
        secretAccessKey: process.env.secretAccessKey,
    },
    region: 'us-east-2'
};

var client = new LambdaClient(config);

async function inv(params) {
    console.log("sending: \n" + JSON.stringify(params));
    const input = { // InvocationRequest
        FunctionName: "arn:aws:lambda:us-east-2:339712976119:function:WW-NOTIFS", // required
        InvocationType: "RequestResponse",
        LogType: "Tail",
        Payload: JSON.stringify(params), // e.g. Buffer.from("") or new TextEncoder().encode("")
    };
    const command = new InvokeCommand(input);
    const response = await client.send(command);
    console.log(response);    
}

inv({ ploc: 'value',  uid:'testuid', pid: 'testPID'});
module.exports = {inv};