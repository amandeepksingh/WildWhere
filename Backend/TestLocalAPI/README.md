To run the local server:
    type "npm start" into the terminal (uses 'nodemon' package)

To test the local server:
    open postman
    run a new get request to localhost:3000/_insertRoute_/_insertParams_
    this should return a response from the app

Logging:
    any calls to api will be logged in server as they come in (uses 'morgan' package)
        "TYPE call response time - idk"

Testing:
    use Postman api to send and recieve requets
        specify body with body/raw/json