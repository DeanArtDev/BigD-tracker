import { describe, it, expect, vi } from 'vitest';
import { RmqLoggerSerializer } from '../../src/loggers/rmq-logger-serializer';
import { instanceToPlain } from 'class-transformer';

describe('RmqLoggerSerializer', () => {
  it('serializes response.data when present', () => {
    const spyDir = vi.spyOn(console, 'dir').mockImplementation(() => {});
    const spyPlain = vi.spyOn(require('class-transformer'), 'instanceToPlain');
    const inst = new RmqLoggerSerializer();
    const data = { foo: 'bar' };
    const result = inst.serialize({ response: { data } });
    expect(spyPlain).toHaveBeenCalled();
    expect(result).toEqual({ data: instanceToPlain(data, { exposeUnsetFields: false }) });
    spyDir.mockRestore();
    spyPlain.mockRestore();
  });

  it('logs plain object', () => {
    const spyDir = vi.spyOn(console, 'dir').mockImplementation(() => {});
    const inst = new RmqLoggerSerializer();
    const obj = { test: 1 };
    expect(inst.serialize(obj)).toEqual(obj);
    expect(spyDir).toHaveBeenCalled();
    spyDir.mockRestore();
  });
});
