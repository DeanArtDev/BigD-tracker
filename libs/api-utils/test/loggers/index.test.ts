import { describe, it, expect } from 'vitest';
import * as index from '../../src/loggers';
import { RmqLoggerSerializer } from '../../src/loggers/rmq-logger-serializer';
import { RmqLoggerDeserializer } from '../../src/loggers/rmq-logger-deserializer';

describe('loggers index exports', () => {
  it('re-exports logger classes', () => {
    expect(index.RmqLoggerSerializer).toBe(RmqLoggerSerializer);
    expect(index.RmqLoggerDeserializer).toBe(RmqLoggerDeserializer);
  });
});
