import { RmqInboundLoggingInterceptor } from '@big-d/api-utils';
import { INestMicroservice, ValidationPipe } from '@nestjs/common';
import { GoalExceptionToRpc } from '@shared/exception-filters';

function addApplicationUses(microservice: INestMicroservice) {
  microservice.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет лишние поля
      forbidNonWhitelisted: false, // выбрасывает ошибку, если есть лишние поля
      transform: true, // включает class-transformer (plainToInstance)
    }),
  );

  microservice.useGlobalFilters(new GoalExceptionToRpc());
  microservice.useGlobalInterceptors(microservice.get(RmqInboundLoggingInterceptor));
}

export { addApplicationUses };
