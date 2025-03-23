const amqp = require('amqplib');
const db = require('./db');

async function consumeMessages() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'SUBMITTED_QUESTIONS';

    await channel.assertQueue(queue, { durable: true });
    console.log("✅ ETL Service listening for messages...");

    channel.consume(queue, async (msg) => {
        if (msg !== null) {
            const questionData = JSON.parse(msg.content.toString());
            console.log("📥 Received question:", questionData);

            // Insert into database
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

            console.log("✅ Question saved to database!");
            channel.ack(msg); // Acknowledge message
        }
    });
}

consumeMessages();
