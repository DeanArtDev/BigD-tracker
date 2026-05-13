import { RmqInboundLoggingInterceptor } from '@big-d/api-utils';
import { INestMicroservice, ValidationPipe } from '@nestjs/common';
import { GoalExceptionToRpc } from '@shared/exception-filters';
import { RequestContextInterceptor } from '@shared/request-context';

function addApplicationUses(microservice: INestMicroservice) {
  microservice.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove useless fields
      forbidNonWhitelisted: false, // throw an error if there is a unknown field
      transform: true, // transform plain to instance
    }),
  );

  microservice.useGlobalFilters(new GoalExceptionToRpc());
  microservice.useGlobalInterceptors(microservice.get(RmqInboundLoggingInterceptor));
  microservice.useGlobalInterceptors(microservice.get(RequestContextInterceptor));
}

export { addApplicationUses };
