import { Deserializer, RmqOptions, Serializer, Transport } from '@nestjs/microservices';

const GOAL_SERVICE_RMQ_KEY = Symbol('GOAL_SERVICE_RMQ_KEY');

const   goalServiceRmqConfig = (params: {
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
      queue: 'goal_service_queue',
      queueOptions: { durable: isProd, autoDelete: true },
      exchange: 'goal_service_exchange',
      exchangeType: 'topic',
      wildcards: true,
      deserializer,
      serializer,
    },
  };
};

export { goalServiceRmqConfig, GOAL_SERVICE_RMQ_KEY };
