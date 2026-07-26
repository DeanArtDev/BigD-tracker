import { act, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NavigationProgressProvider } from './navigation-progress';
import { AppLink } from '../app-link';

let linkPending = false;

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  useLinkStatus: () => ({ pending: linkPending }),
}));

function renderNavigationProgress() {
  function NavigationProgressTestHarness() {
    return (
      <NavigationProgressProvider>
        <AppLink href="/next-page">Следующая страница</AppLink>
      </NavigationProgressProvider>
    );
  }

  return {
    ...render(<NavigationProgressTestHarness />),
    NavigationProgressTestHarness,
  };
}

function getProgressIndicator() {
  return screen.getByRole('progressbar', { name: 'Загрузка страницы' }).firstElementChild;
}

describe('NavigationProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    linkPending = false;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the progress bar transparent during a quick navigation', () => {
    const { rerender, NavigationProgressTestHarness } = renderNavigationProgress();

    linkPending = true;
    rerender(<NavigationProgressTestHarness />);

    act(() => vi.advanceTimersByTime(119));

    linkPending = false;
    rerender(<NavigationProgressTestHarness />);
    act(() => vi.runAllTimers());

    expect(getProgressIndicator()).toHaveClass('bg-transparent');
    expect(getProgressIndicator()).toHaveStyle({ width: '0%' });
  });

  it('shows, completes and resets the progress bar during a longer navigation', () => {
    const { rerender, NavigationProgressTestHarness } = renderNavigationProgress();

    linkPending = true;
    rerender(<NavigationProgressTestHarness />);
    act(() => vi.advanceTimersByTime(120));

    expect(getProgressIndicator()).not.toHaveClass('bg-transparent');
    expect(getProgressIndicator()).toHaveStyle({ width: '12%' });

    linkPending = false;
    rerender(<NavigationProgressTestHarness />);

    expect(getProgressIndicator()).toHaveStyle({ width: '100%' });

    act(() => vi.advanceTimersByTime(220));

    expect(getProgressIndicator()).toHaveClass('bg-transparent');
    expect(getProgressIndicator()).toHaveStyle({ width: '0%' });
  });
});
