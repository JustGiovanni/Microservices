const amqp = require('amqplib');

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue('SUBMITTED_QUESTIONS', { durable: true });
        return channel;
    } catch (error) {
        console.error("RabbitMQ Connection Error:", error);
    }
}

module.exports = connectRabbitMQ;
