import { describe, it, expect, vi } from 'vitest';
import { RmqLoggerDeserializer } from '../../src/loggers/rmq-logger-deserializer';

describe('RmqLoggerDeserializer', () => {
  it('logs and returns the value', () => {
    const spy = vi.spyOn(console, 'dir').mockImplementation(() => {});
    const inst = new RmqLoggerDeserializer();
    const value = { a: 1 };
    expect(inst.deserialize(value)).toEqual(value);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
