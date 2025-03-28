const mysql = require('mysql2/promise');  // Import mysql2 for promise-based MySQL operations

// Create a connection pool using environment variables for MySQL connection details
const pool = mysql.createPool({
    host: process.env.DB_HOST,  // Database host (from environment variable)
    user: process.env.DB_USER,  // Database user (from environment variable)
    password: process.env.DB_PASSWORD,  // Database password (from environment variable)
    database: process.env.DB_NAME,  // Database name (from environment variable)
    waitForConnections: true,  // Wait for connections if the pool is at max size
    connectionLimit: 10,  // Max number of connections in the pool
    queueLimit: 0  // No limit on the query queue length
});

// Export the pool for use in other parts of the application
module.exports = pool;
