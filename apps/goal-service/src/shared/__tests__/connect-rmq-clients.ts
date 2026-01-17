import { appConfigFactory } from '@/infrastructure/configs';
import { goalServiceRmqConfig } from '@big-d/api-contracts';
import { ClientProxyFactory } from '@nestjs/microservices';
import { TestingModule } from '@nestjs/testing';

async function connectRmqClients(params: { testingModule: TestingModule }) {
  const config = appConfigFactory();

  const microservice = params.testingModule.createNestMicroservice(
    goalServiceRmqConfig({
      host: config.RMQ_HOST,
      port: config.RMQ_PORT,
      user: config.RMQ_USER,
      password: config.RMQ_PASSWORD,
      isProd: false,
    }),
  );
  await microservice.listen();

  const client = ClientProxyFactory.create(
    goalServiceRmqConfig({
      host: config.RMQ_HOST,
      port: config.RMQ_PORT,
      user: config.RMQ_USER,
      password: config.RMQ_PASSWORD,
      isProd: false,
    }),
  );
  await client.connect();

  return {
    microservice,
    client,
  };
}

export { connectRmqClients };
