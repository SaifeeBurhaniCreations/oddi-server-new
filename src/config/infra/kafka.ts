import { Kafka } from 'kafkajs';
import type { Consumer, Producer } from 'kafkajs';

export const kafka = new Kafka({
    clientId: 'Oddiville',
    brokers: ['localhost:9092'],
});

export const producer: Producer = kafka.producer();
export const consumer: Consumer = kafka.consumer({ groupId: 'oddiville-group' });

export async function bootstrap() {
    await producer.connect();
    await consumer.connect();
}


// docker-compose up -d
// docker-compose down
