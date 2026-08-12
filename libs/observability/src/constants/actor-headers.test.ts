import { describe, expect, it } from 'vitest';
import { decodeActorHeaders, encodeActorHeaders } from './actor-headers';
import {
  ACTOR_INITIATOR_HEADER_KEY,
  ACTOR_JOB_NAME_HEADER_KEY,
  ACTOR_SERVICE_NAME_HEADER_KEY,
  ACTOR_USER_ID_HEADER_KEY,
} from './http-headers';

describe('actor transport headers', () => {
  it('round-trips every supported actor shape', () => {
    const actors = [
      { initiator: 'user', userId: 26 },
      { initiator: 'anonymous' },
      { initiator: 'service', serviceName: 'api-gateway' },
      { initiator: 'scheduler', jobName: 'task-recurrence' },
      { initiator: 'system' },
    ] as const;

    actors.forEach((actor) => expect(decodeActorHeaders(encodeActorHeaders(actor))).toEqual(actor));
  });

  it('reads Buffer values supplied by the AMQP client', () => {
    expect(
      decodeActorHeaders({
        [ACTOR_INITIATOR_HEADER_KEY]: Buffer.from('service'),
        [ACTOR_SERVICE_NAME_HEADER_KEY]: Buffer.from('api-gateway'),
      }),
    ).toEqual({ initiator: 'service', serviceName: 'api-gateway' });
  });

  it('falls back to anonymous for malformed actor metadata', () => {
    expect(decodeActorHeaders({ [ACTOR_INITIATOR_HEADER_KEY]: 'user' })).toEqual({ initiator: 'anonymous' });
    expect(
      decodeActorHeaders({
        [ACTOR_INITIATOR_HEADER_KEY]: 'scheduler',
        [ACTOR_JOB_NAME_HEADER_KEY]: '',
        [ACTOR_USER_ID_HEADER_KEY]: 26,
      }),
    ).toEqual({ initiator: 'anonymous' });
  });
});
