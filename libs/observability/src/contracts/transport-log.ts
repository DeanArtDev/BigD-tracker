type TransportDirection = 'inbound' | 'outbound';

interface TransportBaseLog {
  /** Direction relative to the service emitting the log. */
  readonly direction: TransportDirection;

  /** Stable technical handler or operation name without dynamic identifiers. */
  readonly operation: string;
}

interface HttpTransportLog extends TransportBaseLog {
  readonly type: 'http';
  readonly method: string;
  readonly route: string;
  /** Available after the HTTP operation completes. */
  readonly statusCode?: number;
  /** Include only when permitted by the data-retention policy. */
  readonly clientIp?: string;
  /** Safe, length-limited HTTP metadata. */
  readonly referer?: string;
  readonly userAgent?: string;
  readonly contentType?: string;
}

interface GraphqlTransportLog extends TransportBaseLog {
  readonly type: 'graphql';
  readonly operationType: 'query' | 'mutation' | 'subscription';
  /** Client-defined operation name, for example `UpdateTaskMutation`. */
  readonly operationName?: string;
  /** Root GraphQL field being resolved, for example `updateTask`. */
  readonly fieldName?: string;
}

interface RmqTransportLog extends TransportBaseLog {
  readonly type: 'rmq';
  readonly exchange?: string;
  readonly routingKey: string;
  readonly messageId?: string;
  /** Broker metadata available for inbound messages. */
  readonly deliveryTag?: number;
  readonly redelivered?: boolean;
  /** Processing or delivery attempt number when retries are configured. */
  readonly attempt?: number;
}

/**
 * Database transport metadata used only for standalone database error logs.
 * Regular and slow database queries are intentionally outside the current contract.
 */
interface DatabaseTransportLog extends Omit<TransportBaseLog, 'direction'> {
  readonly type: 'database';
  readonly direction: 'outbound';
  readonly system: 'postgresql';
  /** Include only when the affected table is known reliably. */
  readonly table?: string;
}

type RequestTransportLog = HttpTransportLog | GraphqlTransportLog | RmqTransportLog;
type TransportLog = RequestTransportLog | DatabaseTransportLog;

export {
  type DatabaseTransportLog,
  type GraphqlTransportLog,
  type HttpTransportLog,
  type RequestTransportLog,
  type RmqTransportLog,
  type TransportDirection,
  type TransportLog,
};
