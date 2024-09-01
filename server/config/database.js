const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'sql209.infinityfree.com',  // MySQL Host Name
  user: 'if0_37222858',            // MySQL User Name
  password: 'SSJmldJnlLV', // MySQL Password (Replace with your actual vPanel password)
  database: 'if0_37222858_Stoppages_Logs_database', // MySQL DB Name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

connection.getConnection(async (err, conn) => {
  if (err) {
    console.error('Error connecting to database: ', err);
    return;
  }
  console.log('Connected to database!');
  conn.release();
});

module.exports = connection;
