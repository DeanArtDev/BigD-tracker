import { describe, expect, it } from 'vitest';
import { createAppContext, RequestContext, resolveSafeTimezone } from '.';

describe('request context', () => {
  it('normalizes defaults and preserves explicit propagation values', () => {
    const generated = new RequestContext({ source: 'rmq' });
    const explicit = new RequestContext({
      source: 'http',
      correlationId: 'cid-123',
      userTimezone: 'Asia/Novosibirsk',
      userId: 26,
    });

    expect(generated.correlationId).toEqual(expect.any(String));
    expect(generated.state.userTimezone).toBe('UTC');
    expect(explicit.state).toEqual({
      source: 'http',
      correlationId: 'cid-123',
      userTimezone: 'Asia/Novosibirsk',
      userId: 26,
    });
  });

  it('isolates concurrent async request contexts', async () => {
    const storage = createAppContext();
    const first = new RequestContext({ source: 'rmq', correlationId: 'first' });
    const second = new RequestContext({ source: 'rmq', correlationId: 'second' });

    const values = await Promise.all([
      storage.run(first, async () => {
        await Promise.resolve();
        return storage.getStore()?.correlationId;
      }),
      storage.run(second, async () => {
        await Promise.resolve();
        return storage.getStore()?.correlationId;
      }),
    ]);

    expect(values).toEqual(['first', 'second']);
    expect(storage.getStore()).toBeUndefined();
  });

  it('falls back to UTC for missing or invalid timezones', () => {
    expect(resolveSafeTimezone()).toBe('UTC');
    expect(resolveSafeTimezone('invalid/timezone')).toBe('UTC');
    expect(resolveSafeTimezone('Asia/Novosibirsk')).toBe('Asia/Novosibirsk');
  });
});
