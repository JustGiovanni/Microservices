// Importing express and setting up the router for handling API routes
const express = require("express");
const router = express.Router();

// Importing the database connection pool to interact with MySQL
const db = require("./db");

// ✅ Endpoint to submit a new question
router.post("/submit", async (req, res) => {
    try {
        // Destructuring values from the request body (the question data)
        const { category_id, question_text, option_1, option_2, option_3, option_4, correct_option } = req.body;

        // Validate that all fields are provided
        if (!category_id || !question_text || !option_1 || !option_2 || !option_3 || !option_4 || !correct_option) {
            // If any required field is missing, return an error response with status 400
            return res.status(400).json({ error: "All fields are required" });
        }

        // Prepare the SQL query to insert a new question into the 'questions' table
        const query = `
            INSERT INTO questions (category_id, question_text, option_1, option_2, option_3, option_4, correct_option)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        // Array containing the values to be inserted into the database
        const params = [category_id, question_text, option_1, option_2, option_3, option_4, correct_option];

        // Execute the query using the database connection pool
        const [result] = await db.query(query, params);

        // Respond with a success message and the ID of the newly inserted question
        res.json({ message: "Question submitted successfully", question_id: result.insertId });
    } catch (err) {
        // Log any database errors and respond with a generic server error
        console.error("Database Insert Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Endpoint to get all categories for populating the category selection in the UI
router.get("/categories", async (req, res) => {
    try {
        // Execute a query to retrieve all categories from the 'categories' table
        const [categories] = await db.query("SELECT * FROM categories");
        // Respond with the retrieved categories
        res.json(categories);
    } catch (err) {
        // Log any database errors and respond with a generic server error
        console.error("Database Query Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Endpoint to get all submitted questions (for admin or users to view questions)
router.get("/submitted", async (req, res) => {
    try {
        // Query to get all questions from the 'questions' table, ordered by ID in descending order
        const [questions] = await db.query("SELECT * FROM questions ORDER BY id DESC");
        // Respond with the list of questions
        res.json(questions);
    } catch (err) {
        // Log any errors encountered during query execution and respond with a generic error message
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Exporting the router so it can be used in the main app
module.exports = router;
