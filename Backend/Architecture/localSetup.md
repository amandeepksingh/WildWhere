To prepare the local database, open psql as postgres user:
```
CREATE USER wildwhere WITH PASSWORD 'CS320ROCKS!!';
CREATE DATABASE wildwhere;
```
From local command line (in Wildwhere/Backend directory):
```
psql -h localhost -U postgres -d wildwhere -a -f tables.sql
```
Open psql as postgres user:
```
GRANT SELECT, INSERT, DELETE, UPDATE ON posts TO wildwhere;  
GRANT SELECT, INSERT, DELETE, UPDATE ON users TO wildwhere;
``` 
TODO: STILL NEED TO DO THIS ON THE EC2

Note that for me this command worked from cmd but not powershell, not sure why...

To run the local server: type ```npm start``` into the terminal in the Wildwhere/Backend directory (uses 'nodemon' package)

Logging: any calls to api will be logged in server as they come in (uses 'morgan' package) "TYPE call response time - idk"

Testing: use Postman api to send and recieve requets, specify body with body/raw/json