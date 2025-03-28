const express = require('express');  // Importing Express library for creating the API
const path = require('path');  // This module is used to handle and transform file paths
const db = require('./db');  // Importing our database connection (we'll query the database later)
const cors = require('cors');  // CORS middleware for enabling cross-origin requests (useful when frontend and backend are on different servers)
const fs = require('fs');  // File system module to interact with files (used for caching categories)
const axios = require('axios');  // Axios is a promise-based HTTP client for making requests (to interact with other services)
const amqp = require('amqplib');  // AMQP library for connecting to RabbitMQ (message broker)

// Create an Express app instance
const app = express();

// Setting the port for the service, or fallback to 5001 if not provided by environment variables
const PORT = process.env.PORT || 5001;

// Define the URL for the Question service and RabbitMQ service
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || 'http://question_service:5000';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

// Path to store the cached categories data locally
const CACHE_FILE = '/app/cache/categories.json';

// Middleware to parse JSON data in request bodies
app.use(express.json());  // Allows us to accept JSON requests
app.use(cors());  // Enable cross-origin resource sharing (CORS) for the API
app.use(express.static(path.join(__dirname, 'public')));  // Serve static frontend files (if any) from the 'public' folder

let rabbitChannel;  // This will hold the RabbitMQ channel once connected

//  Establish RabbitMQ Connection
// This function connects to RabbitMQ and sets up the message queue for submitted questions
async function connectToRabbitMQ() {
    try {
        // Connecting to RabbitMQ using the URL provided (defaults to the RabbitMQ container name in Docker)
        const connection = await amqp.connect(RABBITMQ_URL);
        rabbitChannel = await connection.createChannel();  // Create a channel to send messages
        await rabbitChannel.assertQueue('SUBMITTED_QUESTIONS', { durable: true });  // Ensure the 'SUBMITTED_QUESTIONS' queue exists
        console.log(" Connected to RabbitMQ!");  // Let us know when the connection is successful
    } catch (error) {
        console.error(" RabbitMQ Connection Error:", error);  // Log the error if the connection fails
        setTimeout(connectToRabbitMQ, 5000);  // If the connection fails, try again after 5 seconds
    }
}

//  Fetch categories from the Question Service & cache them locally
// This function calls the Question Service to get categories and saves them to a local file
async function updateCategoryCache() {
    try {
        // Send a GET request to the Question Service to fetch categories
        const response = await axios.get(`${QUESTION_SERVICE_URL}/categories`);
        const categories = response.data;  // Extract the categories from the response

        // Write the categories to the cache file on disk
        fs.writeFileSync(CACHE_FILE, JSON.stringify(categories, null, 2));
        console.log(" Categories cached successfully!");  // Log success message

        return categories;  // Return the categories for further use
    } catch (error) {
        console.error(" Error fetching categories:", error);  // Log any error that happens during the fetch
        return null;  // Return null if something went wrong
    }
}

//  API: Get categories (check if they're cached first, or fetch from Question Service)
app.get('/categories', async (req, res) => {
    try {
        // Check if the categories data exists in the cache
        if (fs.existsSync(CACHE_FILE)) {
            // If cache file exists, read it and return the categories
            const cachedData = fs.readFileSync(CACHE_FILE, 'utf-8');
            return res.json(JSON.parse(cachedData));  // Send cached categories as JSON response
        } else {
            // If there's no cache, fetch categories from the Question Service
            const categories = await updateCategoryCache();
            if (categories) return res.json(categories);  // Return the fetched categories
            res.status(500).json({ error: "Failed to fetch categories" });  // If fetching fails, send an error
        }
    } catch (error) {
        console.error(" Error retrieving categories:", error);  // Log errors that happen during category retrieval
        res.status(500).json({ error: "Internal Server Error" });  // Send internal server error response
    }
});

//  API: Submit a new question (send to RabbitMQ)
app.post('/submit', async (req, res) => {
    try {
        // Extract data from the request body
        const { category_id, question_text, option_1, option_2, option_3, option_4, correct_option } = req.body;

        // Check if all required fields are provided
        if (!category_id || !question_text || !option_1 || !option_2 || !option_3 || !option_4 || !correct_option) {
            return res.status(400).json({ error: 'All fields are required' });  // Show error if any field is missing
        }

        // Create the question data object to send to RabbitMQ
        const questionData = { category_id, question_text, option_1, option_2, option_3, option_4, correct_option };

        //  Send question to RabbitMQ queue
        rabbitChannel.sendToQueue('SUBMITTED_QUESTIONS', Buffer.from(JSON.stringify(questionData)), { persistent: true });

        console.log(" Question submitted to RabbitMQ:", questionData);  // Log the question being sent to RabbitMQ
        res.json({ message: ' Question submitted successfully!' });  // Respond to the client confirming the submission
    } catch (error) {
        console.error(" Error submitting question:", error);  // Log any errors during question submission
        res.status(500).json({ error: "Internal Server Error" });  // Show internal server error response
    }
});

// my API: Add a new category
app.post('/add-category', async (req, res) => {
    try {
        const { name } = req.body;  // Extract the category name from the request body
        if (!name) return res.status(400).json({ error: 'Category name is required' });  // Error if category name is missing

        // Insert the new category into the database
        const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);

        res.json({ message: ' Category added successfully!', category_id: result.insertId });  // Return success message with the category ID

        //  Update cache after adding a category
        updateCategoryCache();  // Refresh the category cache
    } catch (error) {
        console.error(" Error adding category:", error);  // Log errors during category addition
        res.status(500).json({ error: "Internal Server Error" });  // Send internal server error response
    }
});

//  API: Get all submitted questions (direct from DB)
app.get('/submitted', async (req, res) => {
    try {
        // Query the database for all submitted questions and their associated categories
        const [questions] = await db.query(`
            SELECT q.id, q.question_text, q.option_1, q.option_2, q.option_3, q.option_4, q.correct_option, c.name AS category
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            ORDER BY q.id DESC
        `);
        res.json(questions);  // Return the questions as JSON response
    } catch (error) {
        console.error("Error retrieving questions:", error);  // Log any errors while fetching questions from the database
        res.status(500).json({ error: "Internal Server Error" });  // Send internal server error response
    }
});

//  My API: Health check
app.get('/health', (req, res) => {
    res.json({ status: "Submit Service is running" });  // Respond with a simple health check message
});

//  Start the server & connect to RabbitMQ
app.listen(PORT, async () => {
    console.log(` Submit Service running on http://localhost:${PORT}`);  // Log when the service is running and the port it's listening on
    await connectToRabbitMQ();  // Connect to RabbitMQ when the server starts
    await updateCategoryCache();  // Fetch and cache categories when the server starts
});
