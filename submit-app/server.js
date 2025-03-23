const express = require('express');
const path = require('path');
const db = require('./db'); // Database connection
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const amqp = require('amqplib');

const app = express();
const PORT = process.env.PORT || 5001;
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || 'http://question_service:5000';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const CACHE_FILE = '/app/cache/categories.json';

app.use(express.json()); // Enable JSON parsing
app.use(cors()); // Enable CORS
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files

let rabbitChannel;

// ✅ Establish RabbitMQ Connection
async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        rabbitChannel = await connection.createChannel();
        await rabbitChannel.assertQueue('SUBMITTED_QUESTIONS', { durable: true });
        console.log("✅ Connected to RabbitMQ!");
    } catch (error) {
        console.error("❌ RabbitMQ Connection Error:", error);
        setTimeout(connectToRabbitMQ, 5000); // Retry after 5 seconds
    }
}

// ✅ Fetch categories from Question Service & cache them
async function updateCategoryCache() {
    try {
        const response = await axios.get(`${QUESTION_SERVICE_URL}/categories`);
        const categories = response.data;

        // Store in cache file
        fs.writeFileSync(CACHE_FILE, JSON.stringify(categories, null, 2));
        console.log("✅ Categories cached successfully!");

        return categories;
    } catch (error) {
        console.error("❌ Error fetching categories:", error);
        return null;
    }
}

// ✅ API: Get categories (from cache if needed)
app.get('/categories', async (req, res) => {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const cachedData = fs.readFileSync(CACHE_FILE, 'utf-8');
            return res.json(JSON.parse(cachedData));
        } else {
            const categories = await updateCategoryCache();
            if (categories) return res.json(categories);
            res.status(500).json({ error: "Failed to fetch categories" });
        }
    } catch (error) {
        console.error("❌ Error retrieving categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ API: Submit a new question (sends to RabbitMQ)
app.post('/submit', async (req, res) => {
    try {
        const { category_id, question_text, option_1, option_2, option_3, option_4, correct_option } = req.body;

        if (!category_id || !question_text || !option_1 || !option_2 || !option_3 || !option_4 || !correct_option) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const questionData = { category_id, question_text, option_1, option_2, option_3, option_4, correct_option };

        // ✅ Send question to RabbitMQ queue
        rabbitChannel.sendToQueue('SUBMITTED_QUESTIONS', Buffer.from(JSON.stringify(questionData)), { persistent: true });

        console.log("📤 Question submitted to RabbitMQ:", questionData);
        res.json({ message: '✅ Question submitted successfully!' });
    } catch (error) {
        console.error("❌ Error submitting question:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ API: Add a new category
app.post('/add-category', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Category name is required' });

        const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);

        res.json({ message: '✅ Category added successfully!', category_id: result.insertId });

        // ✅ Update cache after adding a category
        updateCategoryCache();
    } catch (error) {
        console.error("❌ Error adding category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ API: Get all submitted questions (direct from DB)
app.get('/submitted', async (req, res) => {
    try {
        const [questions] = await db.query(`
            SELECT q.id, q.question_text, q.option_1, q.option_2, q.option_3, q.option_4, q.correct_option, c.name AS category
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            ORDER BY q.id DESC
        `);
        res.json(questions);
    } catch (error) {
        console.error("❌ Error retrieving questions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ API: Health check
app.get('/health', (req, res) => {
    res.json({ status: "Submit Service is running" });
});

// ✅ Start the server & connect to RabbitMQ
app.listen(PORT, async () => {
    console.log(`🚀 Submit Service running on http://localhost:${PORT}`);
    await connectToRabbitMQ();
    await updateCategoryCache();
});
