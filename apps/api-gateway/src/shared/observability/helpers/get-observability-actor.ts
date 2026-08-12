import type { ActorLog } from '@big-d/observability';

function getObservabilityActor(tokenPayload: unknown): ActorLog {
  if (tokenPayload == null || typeof tokenPayload !== 'object' || !('uid' in tokenPayload)) {
    return { initiator: 'anonymous' };
  }

  return typeof tokenPayload.uid === 'number'
    ? { initiator: 'user', userId: tokenPayload.uid }
    : { initiator: 'anonymous' };
}

export { getObservabilityActor };
