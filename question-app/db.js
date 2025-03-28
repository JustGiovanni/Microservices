const mysql = require('mysql2/promise');  // Import the mysql2 library with promise support (so we can use async/await)


// i  Created a connection pool
// A connection pool allows us to manage multiple connections to the MySQL database at once
// It's more efficient than creating a new connection for every query, as it reuses connections.
const db = mysql.createPool({
    host: 'mysql-db',  // The host where the MySQL database is running. In this case, it's a service named 'mysql-db' (could be a Docker container or a remote host)
    user: 'root',  // The username to connect to the database (root user in this case)
    password: 'rootpassword',  // The password for the 'root' user (same as the one used when creating the MySQL container in Docker)
    database: 'quizdb',  // The name of the database to connect to (quizdb is the name of our database)
    
    // Additional configuration options:
    waitForConnections: true,  // Whether to wait for an available connection when the pool is at maximum capacity (defaults to true)
    connectionLimit: 10,  // The maximum number of connections allowed in the pool at a time (we're setting it to 10 connections)
    queueLimit: 0  // The maximum number of queued connection requests (set to 0 means no limit on the queue)
});


// Export the connection pool so that it can be used in other parts of the application
// This allows us to easily access the database from other files by importing this module.
module.exports = db;
