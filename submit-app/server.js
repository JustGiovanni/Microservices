const express = require('express');
const path = require('path');
const db = require('./db'); // Import database connection
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for frontend requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files

// ✅ Get all categories for the dropdown
app.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT id, name FROM categories');
        console.log("Fetched Categories:", categories); // Debugging
        res.json(categories);
    } catch (err) {
        console.error('Database Query Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ Submit a new question
app.post('/submit', async (req, res) => {
    try {
        const { category_id, question_text, option_1, option_2, option_3, option_4, correct_option } = req.body;

        if (!category_id || !question_text || !option_1 || !option_2 || !option_3 || !option_4 || !correct_option) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Insert question into the database
        const query = `
            INSERT INTO questions (category_id, question_text, option_1, option_2, option_3, option_4, correct_option)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [category_id, question_text, option_1, option_2, option_3, option_4, correct_option];

        const [result] = await db.query(query, params);

        res.json({ message: '✅ Question submitted successfully!', question_id: result.insertId });
    } catch (err) {
        console.error('Database Insert Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ Add a new category
app.post('/add-category', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);

        res.json({ message: 'Category added successfully', category_id: result.insertId });
    } catch (err) {
        console.error('Category Insert Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ Get all submitted questions
app.get('/submitted', async (req, res) => {
    try {
        const [questions] = await db.query(`
            SELECT q.id, q.question_text, q.option_1, q.option_2, q.option_3, q.option_4, q.correct_option, c.name AS category
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            ORDER BY q.id DESC
        `);
        res.json(questions);
    } catch (err) {
        console.error('Database Query Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ Start the server
app.listen(PORT, () => console.log(`✅ Submit App running on http://localhost:${PORT}`));
