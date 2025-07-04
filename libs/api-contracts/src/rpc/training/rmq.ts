import { Deserializer, RmqOptions, Serializer, Transport } from '@nestjs/microservices';

const TRAINING_SERVICE_RMQ_KEY = Symbol('TRAINING_SERVICE_RMQ_KEY');

const trainingServiceRmqConfig = (params: {
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  isProd: boolean;
  deserializer?: Deserializer;
  serializer?: Serializer;
}): RmqOptions => {
  const { isProd, port, password, user, host, deserializer, serializer } = params;

  if ([user, password, host, port].some((i) => i == null)) {
    throw new Error(`There are not enough params ${JSON.stringify(params)}`);
  }

  return {
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${user}:${password}@${host}:${port}`],
      queue: 'training_service_queue',
      queueOptions: { durable: isProd, autoDelete: true },
      exchange: 'training_service_exchange',
      exchangeType: 'topic',
      wildcards: true,
      deserializer,
      serializer,
    },
  };
};

export { trainingServiceRmqConfig, TRAINING_SERVICE_RMQ_KEY };
