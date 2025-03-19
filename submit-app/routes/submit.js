const express = require("express");
const router = express.Router();
const db = require("./db");

// ✅ Submit a new question
router.post("/submit", async (req, res) => {
    try {
        const { category_id, question_text, option_1, option_2, option_3, option_4, correct_option } = req.body;

        if (!category_id || !question_text || !option_1 || !option_2 || !option_3 || !option_4 || !correct_option) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const query = `
            INSERT INTO questions (category_id, question_text, option_1, option_2, option_3, option_4, correct_option)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [category_id, question_text, option_1, option_2, option_3, option_4, correct_option];

        const [result] = await db.query(query, params);

        res.json({ message: "Question submitted successfully", question_id: result.insertId });
    } catch (err) {
        console.error("Database Insert Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Get all categories for UI population
router.get("/categories", async (req, res) => {
    try {
        const [categories] = await db.query("SELECT * FROM categories");
        res.json(categories);
    } catch (err) {
        console.error("Database Query Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Get all submitted questions
router.get("/submitted", async (req, res) => {
    try {
        const [questions] = await db.query("SELECT * FROM questions ORDER BY id DESC");
        res.json(questions);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
