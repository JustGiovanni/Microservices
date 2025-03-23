const mysql = require('mysql2/promise');

// Create a connection pool
const db = mysql.createPool({
    host: 'mysql-db',  // Use the correct Docker MySQL service name
    user: 'root',
    password: 'rootpassword',  // Update with the actual MySQL root password
    database: 'quizdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;

