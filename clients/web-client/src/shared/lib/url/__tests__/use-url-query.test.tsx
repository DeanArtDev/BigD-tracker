import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { useUrlQuery } from '../use-url-query';

vi.mock('next/navigation', () => ({
  usePathname: () => window.location.pathname,
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

vi.mock('@/shared/lib', () => ({
  getEnvConfigClient: () => ({ IS_DEV: false, IS_TEST: true }),
}));

const testQuerySchema = z.object({
  tab: z.coerce
    .number()
    .pipe(z.union([z.literal(1), z.literal(2), z.literal(3)]))
    .optional(),
  search: z.string().optional(),
});

describe('useUrlQuery', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/planner/tasks');
  });

  it('parses valid data from the current URL', () => {
    window.history.replaceState(null, '', '/planner/tasks?tab=2&search=report');

    const { result } = renderHook(() => useUrlQuery(testQuerySchema));

    expect(result.current[0]).toEqual({ tab: 2, search: 'report' });
  });

  it('sets query data using the previous valid value', () => {
    window.history.replaceState(null, '', '/planner/tasks?tab=1&search=report');

    const { result, rerender } = renderHook(() => useUrlQuery(testQuerySchema));

    act(() => {
      result.current[1]((previousQuery) => ({ ...previousQuery, tab: 3 }));
    });
    rerender();

    expect(window.location.search).toBe('?tab=3&search=report');
    expect(result.current[0]).toEqual({ tab: 3, search: 'report' });
  });
});
