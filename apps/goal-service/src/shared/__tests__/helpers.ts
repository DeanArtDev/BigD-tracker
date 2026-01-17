import { RmqRecordBuilder } from '@nestjs/microservices';
import { CORRELATION_HEADER_KEY } from '@shared/request-context';
import { randomUUID } from 'crypto';

function buildPayload(payload: unknown) {
  return new RmqRecordBuilder(payload)
    .setOptions({
      headers: {
        [CORRELATION_HEADER_KEY]: randomUUID(),
      },
    })
    .build();
}

export { buildPayload };
