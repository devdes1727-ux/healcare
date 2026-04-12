const mssql = require('mssql/msnodesqlv8');
require('dotenv').config();

const connectionString = process.env.DB_CONNECTION_STRING;

const poolPromise = new mssql.ConnectionPool({
    driver: 'msnodesqlv8',
    connectionString: connectionString
}).connect()
  .then(pool => {
    console.log('Connected to SQL Server via msnodesqlv8');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! ', err.message);
    return null;
  });

module.exports = { mssql, poolPromise };
