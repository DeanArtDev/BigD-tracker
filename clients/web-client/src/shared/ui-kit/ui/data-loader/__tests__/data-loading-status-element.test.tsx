import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoadingStatus, useLoadingStatus } from '../data-loading-status-element';

describe('LoadingStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the result icon visible when idle follows the result status', async () => {
    const { rerender } = render(<LoadingStatus status="loading" />);

    expect(screen.getByRole('status')).toHaveAccessibleName('Загрузка');

    rerender(<LoadingStatus status="success" />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveAccessibleName('Успешно');
    });

    rerender(<LoadingStatus status="idle" />);

    await act(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        }),
    );

    expect(screen.getByRole('status')).toHaveAccessibleName('Успешно');
  });

  it('returns the status to idle after showing the result', () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useLoadingStatus());

    act(() => {
      result.current.setLoadingStatus();
      result.current.setSuccessStatus();
    });

    expect(result.current.loadingStatus).toBe('success');

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    expect(result.current.loadingStatus).toBe('idle');
  });

  it('grows the result icon to its peak and then shrinks it while hiding', () => {
    vi.useFakeTimers();

    const { container, rerender } = render(<LoadingStatus status="loading" />);

    rerender(<LoadingStatus status="success" />);

    act(() => {
      vi.advanceTimersByTime(20);
    });
    act(() => {
      vi.advanceTimersByTime(20);
    });

    const resultIcon = container.querySelector('.stroke-emerald-500');

    expect(resultIcon).toHaveClass('scale-125', 'opacity-100');

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(resultIcon).toHaveClass('scale-0', 'opacity-0');
    expect(resultIcon).toHaveStyle({ transitionDuration: '800ms' });

    if (resultIcon === null) {
      throw new Error('Result icon was not rendered');
    }

    fireEvent.transitionEnd(resultIcon, { propertyName: 'opacity' });

    expect(screen.getByRole('status')).not.toHaveAttribute('aria-label');
  });
});
