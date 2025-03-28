const express = require('express');  // Import the Express library to create our server
const path = require('path');  // Import the path module to handle file paths (useful for serving static files)
const db = require('./db');  // Import the database connection (to query the database)

const app = express();  // Create an instance of an Express app

//  Serve static files (HTML, CSS, JS) from the 'public' folder
// This makes sure that any files in the 'public' directory can be accessed via the browser
app.use(express.static(path.join(__dirname, 'public')));

//  Enable JSON parsing for incoming request bodies
// This allows me to handle requests where the body contains JSON (like when submitting answers)
app.use(express.json()); 

//  Endpoint for submitting an answer
// This API endpoint handles requests when users submit answers to questions
app.post('/submit-answer', async (req, res) => {
    try {
        const { answer, questionId } = req.body;  // Extract the answer and question ID from the request body

        // Check if both answer and questionId are provided
        if (!answer || !questionId) {
            return res.status(400).json({ error: "Answer and question ID are required" });  // If missing, send a 400 error
        }

        // Query the database to get the question with the provided questionId
        const [question] = await db.query('SELECT * FROM questions WHERE id = ?', [questionId]);

        // If the question doesn't exist, return a 404 error
        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        // Check if the submitted answer matches the correct answer
        const correct = question.correct_option === answer;
        res.json({ correct });  // Return the result (true or false) to the user
    } catch (err) {
        console.error("Error submitting answer:", err);  // Log any errors that occur
        res.status(500).json({ error: "Internal Server Error" });  // Send a 500 error if something goes wrong
    }
});

//  Get all categories (for the frontend dropdown)
// This endpoint is used to fetch the list of categories, which the frontend will display in a dropdown
app.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');  // Query the database for all categories
        res.json(categories);  // Return the categories as a JSON response to the frontend
    } catch (err) {
        console.error('Database Query Error:', err);  // Log any errors that happen while querying the database
        res.status(500).json({ error: 'Internal Server Error' });  // Send a 500 error if something goes wrong
    }
});

//  Get questions by category ID
// This endpoint allows the frontend to get random questions from a specific category
app.get('/question/:category', async (req, res) => {
    const { category } = req.params;  // Get the category ID from the URL parameters
    const { count = 1 } = req.query;  // Get the number of questions to fetch (defaults to 1 if not provided)

    try {
        // Query the database to fetch random questions from the specified category
        const query = 'SELECT * FROM questions WHERE category_id = ? ORDER BY RAND() LIMIT ?';
        const params = [category, parseInt(count)];  // Use the category ID and the count as parameters
        const [questions] = await db.query(query, params);  // Execute the query

        res.json(questions);  // Return the questions as a JSON response
    } catch (err) {
        console.error('Database Query Error:', err);  // Log any errors while querying the database
        res.status(500).json({ error: 'Internal Server Error' });  // Send a 500 error if something goes wrong
    }
});

// ✅Start the server
// Start the Express server and listen on the specified port
const PORT = process.env.PORT || 5000;  // Use the port from the environment or default to 5000
app.listen(PORT, () => console.log(`Question App running on port ${PORT}`));  // Log when the server is up and running
