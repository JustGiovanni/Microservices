const express = require("express");
const router = express.Router();
const db = require("./db");

// Get a random question (with category filter)
router.get("/question/:category?", async (req, res) => {
    try {
        const { category } = req.params;
        const { count = 1 } = req.query;

        let query = "SELECT * FROM questions ORDER BY RAND() LIMIT ?";
        let params = [parseInt(count)];

        if (category) {
            query = "SELECT * FROM questions WHERE category_id = ? ORDER BY RAND() LIMIT ?";
            params = [category, parseInt(count)];
        }

        const [questions] = await db.query(query, params);

        res.json(questions);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get all categories
router.get("/categories", async (req, res) => {
    try {
        const [categories] = await db.query("SELECT * FROM categories");
        res.json(categories);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
