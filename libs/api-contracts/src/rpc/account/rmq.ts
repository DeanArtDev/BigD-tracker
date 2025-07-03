import { RmqOptions, Transport } from '@nestjs/microservices';

const ACCOUNT_SERVICE_RMQ_KEY = Symbol('ACCOUNT_SERVICE');

const accountServiceRmqConfig = (params: {
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  isProd: boolean;
}): RmqOptions => {
  const { isProd, port, password, user, host } = params;

  if ([user, password, host, port].some((i) => i == null)) {
    throw new Error(`There are not enough params ${JSON.stringify(params)}`);
  }

  return {
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${user}:${password}@${host}:${port}`],
      queue: 'account_service_queue',
      queueOptions: { durable: isProd, autoDelete: true },
      exchange: 'account_service_exchange',
      exchangeType: 'topic',
      wildcards: true,
    },
  };
};

export { accountServiceRmqConfig, ACCOUNT_SERVICE_RMQ_KEY };
