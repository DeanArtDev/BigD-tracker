import type { ActorLog } from '../contracts';
import {
  ACTOR_INITIATOR_HEADER_KEY,
  ACTOR_JOB_NAME_HEADER_KEY,
  ACTOR_SERVICE_NAME_HEADER_KEY,
  ACTOR_USER_ID_HEADER_KEY,
} from './http-headers';

type ActorHeaderValue = unknown;
type ActorHeaders = Readonly<Record<string, ActorHeaderValue>>;

function encodeActorHeaders(actor: ActorLog): Record<string, string | number> {
  switch (actor.initiator) {
    case 'user':
      return {
        [ACTOR_INITIATOR_HEADER_KEY]: actor.initiator,
        [ACTOR_USER_ID_HEADER_KEY]: actor.userId,
      };
    case 'service':
      return {
        [ACTOR_INITIATOR_HEADER_KEY]: actor.initiator,
        [ACTOR_SERVICE_NAME_HEADER_KEY]: actor.serviceName,
      };
    case 'scheduler':
      return {
        [ACTOR_INITIATOR_HEADER_KEY]: actor.initiator,
        [ACTOR_JOB_NAME_HEADER_KEY]: actor.jobName,
      };
    case 'anonymous':
    case 'system':
      return { [ACTOR_INITIATOR_HEADER_KEY]: actor.initiator };
  }
}

function decodeActorHeaders(headers: ActorHeaders): ActorLog {
  const initiator = getHeaderString(headers, ACTOR_INITIATOR_HEADER_KEY);

  switch (initiator) {
    case 'user': {
      const userId = getHeaderScalar(headers, ACTOR_USER_ID_HEADER_KEY);
      return userId == null ? { initiator: 'anonymous' } : { initiator, userId };
    }
    case 'service': {
      const serviceName = getHeaderString(headers, ACTOR_SERVICE_NAME_HEADER_KEY);
      return serviceName == null ? { initiator: 'anonymous' } : { initiator, serviceName };
    }
    case 'scheduler': {
      const jobName = getHeaderString(headers, ACTOR_JOB_NAME_HEADER_KEY);
      return jobName == null ? { initiator: 'anonymous' } : { initiator, jobName };
    }
    case 'system':
      return { initiator };
    case 'anonymous':
    default:
      return { initiator: 'anonymous' };
  }
}

function getHeaderScalar(headers: ActorHeaders, key: string): string | number | undefined {
  const value = getHeader(headers, key);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
}

function getHeaderString(headers: ActorHeaders, key: string): string | undefined {
  const value = getHeader(headers, key);
  if (Buffer.isBuffer(value)) return value.toString('utf8') || undefined;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getHeader(headers: ActorHeaders, key: string): ActorHeaderValue {
  return headers[key] ?? headers[key.toUpperCase()];
}

export { decodeActorHeaders, encodeActorHeaders, type ActorHeaders };
