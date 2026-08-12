import { INestMicroservice, ValidationPipe } from '@nestjs/common';
import { GoalExceptionToRpc } from '@shared/exception-filters';
import { RmqObservabilityInterceptor } from '@shared/observability';
import { RequestContextInterceptor } from '@shared/request-context';

function addApplicationUses(microservice: INestMicroservice) {
  microservice.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  microservice.useGlobalFilters(new GoalExceptionToRpc());
  microservice.useGlobalInterceptors(
    microservice.get(RequestContextInterceptor),
    microservice.get(RmqObservabilityInterceptor),
  );
}

export { addApplicationUses };
