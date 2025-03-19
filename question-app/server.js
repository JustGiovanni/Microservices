const express = require('express');
const path = require('path');
const db = require('./db');
const app = express();

// Serve static files (HTML, CSS, JS) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json()); // Parse JSON request bodies

// Endpoint for submitting an answer
app.post('/submit-answer', async (req, res) => {
    try {
        const { answer, questionId } = req.body;

        if (!answer || !questionId) {
            return res.status(400).json({ error: "Answer and question ID are required" });
        }

        // Your database query here to check the answer
        const [question] = await db.query('SELECT * FROM questions WHERE id = ?', [questionId]);

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        const correct = question.correct_option === answer;
        res.json({ correct });
    } catch (err) {
        console.error("Error submitting answer:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// ✅ Get all categories (for the frontend dropdown)
app.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.json(categories);
    } catch (err) {
        console.error('Database Query Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ Get questions by category ID
app.get('/question/:category', async (req, res) => {
    const { category } = req.params;
    const { count = 1 } = req.query;

    try {
        const query = 'SELECT * FROM questions WHERE category_id = ? ORDER BY RAND() LIMIT ?';
        const params = [category, parseInt(count)];
        const [questions] = await db.query(query, params);
        res.json(questions);
    } catch (err) {
        console.error('Database Query Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Question App running on port ${PORT}`));
