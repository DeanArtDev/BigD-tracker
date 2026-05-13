import { Deserializer, RmqOptions, Serializer, Transport } from '@nestjs/microservices';

const AUTH_SERVICE_RMQ_KEY = Symbol('AUTH_SERVICE');

const authServiceRmqConfig = (params: {
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
      queue: 'auth_service_queue',
      queueOptions: {
        durable: isProd,
        autoDelete: true,
        arguments: {
          'x-message-ttl': 5000,
        },
      },
      exchange: 'auth_service_exchange',
      exchangeType: 'topic',
      wildcards: true,
      deserializer,
      serializer,
    },
  };
};

export { authServiceRmqConfig, AUTH_SERVICE_RMQ_KEY };
