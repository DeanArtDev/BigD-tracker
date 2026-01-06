import { CORRELATION_HEADER_KEY } from './constants';

function getCorrelationId(message: Record<string, any>): string | undefined {
  return message.properties?.headers?.[CORRELATION_HEADER_KEY];
}

export { getCorrelationId };
