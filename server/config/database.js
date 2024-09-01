const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Oussama2255',
  database: 'new_schema',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

connection.getConnection((err, conn) => {
  if (err) {
    console.error('Error connecting to database: ', err);
    return;
  }
  console.log('Connected to database!');
  conn.release();
});

module.exports = connection;
