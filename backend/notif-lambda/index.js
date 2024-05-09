const pg = require('pg').Pool;

const poolParams = {

    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: process.env.dbPort,
};

console.log(poolParams);
exports.handler = async (event) =>  {
  console.log(event);
  const pool = new Pool(poolParams);
  const client = await pool.connect();
  
  console.log(await client.query("SELECT * FROM users"));
  client.release(true);
  const response = {
    statusCode: 200,
    body: JSON.stringify(event.data),
  };
  return response;
};