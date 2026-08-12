import { describe, expect, it } from 'vitest';
import { MAX_CORRELATION_ID_LENGTH, isValidCorrelationId, resolveCorrelationId } from './correlation-id';

describe('correlation ID', () => {
  it.each(['5158cf08-65c1-40cc-83f5-236216e2904d', 'cid-123', 'gateway:request_42.1'])(
    'keeps a valid incoming value: %s',
    (value) => {
      expect(isValidCorrelationId(value)).toBe(true);
      expect(resolveCorrelationId(value, () => 'generated-id')).toBe(value);
    },
  );

  it.each([
    undefined,
    null,
    '',
    ' correlation-id',
    'correlation id',
    'correlation-id\nforged-log',
    'a'.repeat(MAX_CORRELATION_ID_LENGTH + 1),
    42,
  ])('replaces an invalid incoming value: %p', (value) => {
    expect(isValidCorrelationId(value)).toBe(false);
    expect(resolveCorrelationId(value, () => 'generated-id')).toBe('generated-id');
  });

  it('generates a UUID by default', () => {
    expect(resolveCorrelationId(undefined)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
