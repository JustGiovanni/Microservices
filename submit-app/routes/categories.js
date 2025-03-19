const express = require("express");
const router = express.Router();
const db = require("../db");

// List all categories
router.get("/", async (req, res) => {
    try {
        const [categories] = await db.execute("SELECT * FROM categories");
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Add a new category
router.post("/", async (req, res) => {
    const { category_name } = req.body;

    if (!category_name) {
        return res.status(400).json({ error: "Category name is required." });
    }

    try {
        await db.execute("INSERT INTO categories (name) VALUES (?)", [category_name]);
        res.json({ message: "Category added successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
