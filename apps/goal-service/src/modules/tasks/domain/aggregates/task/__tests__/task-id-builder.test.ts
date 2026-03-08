import { TaskIdBuilder } from '../task-id-builder';

describe('TaskIdBuilder', () => {
  it('wraps and unwraps origin id', () => {
    const id = TaskIdBuilder.wrapOriginId(12);

    expect(id).toBe('o::12');
    expect(TaskIdBuilder.unwrapId(id)).toEqual({ origin: { id: 12 } });
  });

  it('wraps and unwraps virtual id', () => {
    const id = TaskIdBuilder.wrapVirtualId({ recurrenceId: 12, date: '2026-03-02T10:15:00.000Z' });

    expect(id).toBe('v::12::2026-03-02T10:15:00.000Z');
    expect(TaskIdBuilder.unwrapId(id)).toEqual({
      virtual: { recurrenceId: 12, date: '2026-03-02T10:15:00.000Z' },
    });
  });

  it('wraps and unwraps override id', () => {
    const id = TaskIdBuilder.wrapOverrideId({
      recurrenceId: 12,
      date: '2026-03-02T10:15:00.000Z',
      overrideId: 7,
    });

    expect(id).toBe('ov::12::2026-03-02T10:15:00.000Z::7');
    expect(TaskIdBuilder.unwrapId(id)).toEqual({
      override: { recurrenceId: 12, date: '2026-03-02T10:15:00.000Z', overrideId: 7 },
    });
  });

  it('returns undefined for invalid id strings', () => {
    expect(TaskIdBuilder.unwrapId('o::abc')).toBeUndefined();
    expect(TaskIdBuilder.unwrapId('x::1::2::3')).toBeUndefined();
  });

  it('returns undefined for incomplete virtual ids', () => {
    expect(TaskIdBuilder.unwrapId('v::1')).toBeUndefined();
  });

  it('throws for incomplete override ids', () => {
    expect(() => TaskIdBuilder.unwrapId('ov::1::2')).toThrow(TypeError);
  });
});
