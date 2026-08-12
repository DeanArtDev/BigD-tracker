import { describe, expect, it } from 'vitest';

describe('@big-d/observability', () => {
  it('exposes an importable package entry point', async () => {
    const entryPoint = await import('./index');

    expect(entryPoint).toBeTypeOf('object');
  });
});
