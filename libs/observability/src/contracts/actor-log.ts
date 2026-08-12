/**
 * Identifies who initiated an operation.
 *
 * A user actor must remain unchanged while the request travels between services.
 * Technical actors are used only when no user initiated the operation.
 */
type ActorLog =
  | {
      readonly initiator: 'user';
      /** Required for every user-initiated operation. */
      readonly userId: string | number;
    }
  | {
      /** External request whose user identity is not known, for example login or another public operation. */
      readonly initiator: 'anonymous';
    }
  | {
      readonly initiator: 'service';
      /** Stable name of the service that initiated the operation. */
      readonly serviceName: string;
    }
  | {
      readonly initiator: 'scheduler';
      /** Stable name of the scheduled job. Must not contain dynamic identifiers. */
      readonly jobName: string;
    }
  | {
      readonly initiator: 'system';
    };

export { type ActorLog };
