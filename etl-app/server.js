const amqp = require('amqplib');  // Import RabbitMQ library for message queue handling
const db = require('./db');  // Import database module for query execution

async function consumeMessages() {
    // Establish connection to RabbitMQ server
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'SUBMITTED_QUESTIONS';  // Queue name to listen for submitted questions

    // Ensure the queue exists
    await channel.assertQueue(queue, { durable: true });
    console.log("✅ ETL Service listening for messages...");

    // Start consuming messages from the queue
    channel.consume(queue, async (msg) => {
        if (msg !== null) {
            const questionData = JSON.parse(msg.content.toString());  // Parse the message content
            console.log("📥 Received question:", questionData);

            // Insert the question data into the database
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
            channel.ack(msg);  // Acknowledge the message after processing
        }
    });
}

consumeMessages();  // Start consuming messages
