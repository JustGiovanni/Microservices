const amqp = require('amqplib');  // RabbitMQ library for message queue handling
const db = require('./db');  // Database module to execute queries
const fs = require('fs');  // File system module for file operations
const path = require('path');  // Path module for file path handling

const CACHE_FILE = '/app/cache/categories.json';  // File path to store cached categories

// Function to start the ETL (Extract, Transform, Load) service
async function startETL() {
    try {
        // Connect to RabbitMQ server and create a channel
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'SUBMITTED_QUESTIONS';  // Queue to listen for new questions

        // Ensure the queue exists
        await channel.assertQueue(queue, { durable: true });
        console.log("✅ ETL Service connected to RabbitMQ, waiting for messages...");

        // Start consuming messages from the queue
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const questionData = JSON.parse(msg.content.toString());  // Parse the message content
                console.log("📥 Received new question:", questionData);

                try {
                    // ✅ Insert question into MySQL database
                    const query = `INSERT INTO questions (category_id, question_text, option_1, option_2, option_3, option_4, correct_option)
                                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    await db.query(query, [
                        questionData.category_id,
                        questionData.question_text,
                        questionData.option_1,
                        questionData.option_2,
                        questionData.option_3,
                        questionData.option_4,
                        questionData.correct_option
                    ]);

                    console.log("✅ Question inserted into database!");
                    channel.ack(msg);  // Acknowledge the message after processing
                } catch (error) {
                    console.error("❌ Database Insert Error:", error);
                }
            }
        });
    } catch (error) {
        console.error("❌ RabbitMQ Connection Error:", error);
        process.exit(1);  // Exit on RabbitMQ connection error
    }
}

// Function to load categories from the database and cache them
async function updateCategoryCache() {
    try {
        // Fetch categories from the database
        const [categories] = await db.query('SELECT id, name FROM categories');
        fs.writeFileSync(CACHE_FILE, JSON.stringify(categories, null, 2));  // Cache categories in a file
        console.log("✅ Categories cached successfully!");
    } catch (error) {
        console.error("❌ Error updating category cache:", error);
    }
}

// Start the ETL service and update category cache every 5 minutes
startETL();
setInterval(updateCategoryCache, 60000 * 5);  // Update cache every 5 minutes
