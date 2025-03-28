const express = require("express");  // Import express to handle HTTP requests
const router = express.Router();  // Create a new router instance to manage routes separately
const db = require("./db");  // Import the database connection module

// Get a random question (with category filter)
router.get("/question/:category?", async (req, res) => {  // Define a route that gets a random question, category is optional
    try {
        const { category } = req.params;  // Extract the 'category' parameter from the request
        const { count = 1 } = req.query;  // Get the 'count' query parameter to determine how many questions to return (default is 1)

        // Default query to fetch random questions
        let query = "SELECT * FROM questions ORDER BY RAND() LIMIT ?";  // This query gets random questions from the database
        let params = [parseInt(count)];  // Pass the count to the query to limit the number of results

        // If a category is provided, modify the query to filter by category
        if (category) {
            query = "SELECT * FROM questions WHERE category_id = ? ORDER BY RAND() LIMIT ?";  // Modify the query to get questions for a specific category
            params = [category, parseInt(count)];  // Add category as a parameter for the query
        }

        // Execute the query and get the results
        const [questions] = await db.query(query, params);  // Use the db connection to run the query and get questions

        res.json(questions);  // Send the fetched questions as a JSON response
    } catch (err) {  // If an error occurs during the process, handle it
        console.error("Error:", err);  // Log the error to the console
        res.status(500).json({ error: "Internal Server Error" });  // Send a 500 status code and an error message if something goes wrong
    }
});

// Get all categories
router.get("/categories", async (req, res) => {  // Define a route to get all categories
    try {
        const [categories] = await db.query("SELECT * FROM categories");  // Query the database to get all categories
        res.json(categories);  // Send the categories as a JSON response
    } catch (err) {  // If an error occurs during the process, handle it
        console.error("Error:", err);  // Log the error to the console
        res.status(500).json({ error: "Internal Server Error" });  // Send a 500 status code and an error message if something goes wrong
    }
});

// Export the router to use it in other parts of the application
module.exports = router;
