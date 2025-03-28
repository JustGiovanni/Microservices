// Import the mysql2/promise library to enable async/await functionality for MySQL
const mysql = require('mysql2/promise');

// Create a connection pool to manage MySQL connections
const db = mysql.createPool({
    host: 'mysql-db',  // Hostname of the MySQL service (This should match your Docker MySQL service name or host address)
    user: 'root',  // MySQL username (typically 'root' for the root user)
    password: 'rootpassword',  // MySQL root password (make sure to replace this with the actual password)
    database: 'quizdb',  // The database name you want to connect to (in this case, 'quizdb')
    waitForConnections: true,  // Whether to wait for a connection if the pool is at max capacity
    connectionLimit: 10,  // Max number of connections in the pool (adjust as needed for your app's load)
    queueLimit: 0  // Number of requests that can wait for a free connection (0 means unlimited)
});

// Export the connection pool so it can be used in other parts of the application
module.exports = db;
