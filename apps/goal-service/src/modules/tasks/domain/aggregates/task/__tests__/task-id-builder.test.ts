import { TaskIdBuilder } from '../task-id-builder';

describe('TaskIdBuilder', () => {
  it('wraps and unwraps origin id', () => {
    const id = TaskIdBuilder.wrapOriginId(12);

    expect(id).toBe('o:12');
    expect(TaskIdBuilder.unwrapId(id)).toEqual({ origin: { id: 12 } });
  });

  it('wraps and unwraps virtual id', () => {
    const id = TaskIdBuilder.wrapVirtualId({ masterTaskId: 12, timestamp: 1700000000 });

    expect(id).toBe('v:12:1700000000');
    expect(TaskIdBuilder.unwrapId(id)).toEqual({
      virtual: { masterTaskId: 12, timestamp: 1700000000 },
    });
  });

  it('wraps and unwraps override id', () => {
    const id = TaskIdBuilder.wrapOverrideId({
      masterTaskId: 12,
      timestamp: 1700000000,
      overrideId: 7,
    });

    expect(id).toBe('ov:12:1700000000:7');
    expect(TaskIdBuilder.unwrapId(id)).toEqual({
      override: { masterTaskId: 12, timestamp: 1700000000, overrideId: 7 },
    });
  });

  it('returns undefined for invalid id strings', () => {
    expect(TaskIdBuilder.unwrapId('o:abc')).toBeUndefined();
    expect(TaskIdBuilder.unwrapId('x:1:2:3')).toBeUndefined();
  });

  it('throws for malformed numeric segments', () => {
    expect(() => TaskIdBuilder.unwrapId('v:1')).toThrow(TypeError);
    expect(() => TaskIdBuilder.unwrapId('ov:1:2')).toThrow(TypeError);
  });
});
