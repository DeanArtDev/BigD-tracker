/** Header used to propagate one correlation ID through distributed operations. */
const CORRELATION_HEADER_KEY = 'x-correlation-id';

/** Header used to propagate the initiating user's IANA timezone. */
const USER_TIME_ZONE_HEADER_KEY = 'x-user-timezone';

/** Header used to propagate the original operation initiator through internal transports. */
const ACTOR_INITIATOR_HEADER_KEY = 'x-actor-initiator';

/** Header used only when the propagated actor is a user. */
const ACTOR_USER_ID_HEADER_KEY = 'x-actor-user-id';

/** Header used only when the propagated actor is a service. */
const ACTOR_SERVICE_NAME_HEADER_KEY = 'x-actor-service-name';

/** Header used only when the propagated actor is a scheduler. */
const ACTOR_JOB_NAME_HEADER_KEY = 'x-actor-job-name';

export {
  ACTOR_INITIATOR_HEADER_KEY,
  ACTOR_JOB_NAME_HEADER_KEY,
  ACTOR_SERVICE_NAME_HEADER_KEY,
  ACTOR_USER_ID_HEADER_KEY,
  CORRELATION_HEADER_KEY,
  USER_TIME_ZONE_HEADER_KEY,
};
