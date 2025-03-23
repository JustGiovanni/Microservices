const amqp = require('amqplib');
const db = require('./db');
const fs = require('fs');
const path = require('path');

const CACHE_FILE = '/app/cache/categories.json'; // Store cached categories

async function startETL() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'SUBMITTED_QUESTIONS';

        await channel.assertQueue(queue, { durable: true });
        console.log("✅ ETL Service connected to RabbitMQ, waiting for messages...");

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const questionData = JSON.parse(msg.content.toString());
                console.log("📥 Received new question:", questionData);

                try {
                    // ✅ Insert into MySQL
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
                    channel.ack(msg); // Acknowledge message
                } catch (error) {
                    console.error("❌ Database Insert Error:", error);
                }
            }
        });
    } catch (error) {
        console.error("❌ RabbitMQ Connection Error:", error);
        process.exit(1);
    }
}

// ✅ Load categories and cache them
async function updateCategoryCache() {
    try {
        const [categories] = await db.query('SELECT id, name FROM categories');
        fs.writeFileSync(CACHE_FILE, JSON.stringify(categories, null, 2));
        console.log("✅ Categories cached successfully!");
    } catch (error) {
        console.error("❌ Error updating category cache:", error);
    }
}

// Start ETL & update cache periodically
startETL();
setInterval(updateCategoryCache, 60000 * 5); // Update cache every 5 minutes
