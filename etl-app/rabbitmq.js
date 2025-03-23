const amqp = require('amqplib');

async function connectRabbitMQ() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    return connection.createChannel();
}

module.exports = connectRabbitMQ;
