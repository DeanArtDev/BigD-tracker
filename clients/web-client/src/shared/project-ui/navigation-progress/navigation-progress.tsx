'use client';

import { useLinkStatus } from 'next/link';
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { createStrictContext, useStrictContext } from '@/shared/lib/strict-context';
import { cn } from '@/shared/ui-kit/lib/utils';

const SHOW_DELAY_MS = 120;
const FINISH_DURATION_MS = 220;
const PROGRESS_TICK_MS = 350;
const INITIAL_PROGRESS = 12;
const MAX_LOADING_PROGRESS = 88;

type PendingReporter = (source: symbol, pending: boolean) => void;

const NavigationProgressContext = createStrictContext<PendingReporter | null>(null);

function NavigationProgress({ pending }: { readonly pending: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cycle, setCycle] = useState(0);
  const isVisibleRef = useRef(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    const clearTimers = () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(finishTimeoutRef.current);
      clearInterval(progressIntervalRef.current);
    };

    const startProgress = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
      setCycle((currentCycle) => currentCycle + 1);
      setProgress(INITIAL_PROGRESS);

      progressIntervalRef.current = setInterval(() => {
        setProgress((currentProgress) => {
          const remainingProgress = MAX_LOADING_PROGRESS - currentProgress;
          return Math.min(MAX_LOADING_PROGRESS, currentProgress + Math.max(1, remainingProgress * 0.15));
        });
      }, PROGRESS_TICK_MS);
    };

    clearTimers();

    if (pending) {
      if (isVisibleRef.current) {
        startProgress();
      } else {
        showTimeoutRef.current = setTimeout(startProgress, SHOW_DELAY_MS);
      }
    } else if (isVisibleRef.current) {
      setProgress(100);
      finishTimeoutRef.current = setTimeout(() => {
        isVisibleRef.current = false;
        setIsVisible(false);
        setProgress(0);
      }, FINISH_DURATION_MS);
    }

    return clearTimers;
  }, [pending]);

  return (
    <div
      role="progressbar"
      aria-label="Загрузка страницы"
      className="pointer-events-none fixed inset-x-0 z-50 top-0 h-[3px] overflow-hidden"
    >
      <div
        key={cycle}
        className={cn(
          'bg-primary rounded-4xl h-full shadow-[0_0_8px_var(--color-primary)] transition-[width] ease-out motion-reduce:transition-none',
          {
            'bg-transparent': !isVisible,
          },
        )}
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? `${FINISH_DURATION_MS - 40}ms` : `${PROGRESS_TICK_MS}ms`,
        }}
      />
    </div>
  );
}

function NavigationProgressProvider({ children }: PropsWithChildren) {
  const pendingLinksRef = useRef(new Set<symbol>());
  const [pending, setPending] = useState(false);

  const reportPending = useCallback<PendingReporter>((source, isPending) => {
    if (isPending) {
      pendingLinksRef.current.add(source);
    } else {
      pendingLinksRef.current.delete(source);
    }

    setPending(pendingLinksRef.current.size > 0);
  }, []);

  return (
    <NavigationProgressContext value={reportPending}>
      <NavigationProgress pending={pending} />
      {children}
    </NavigationProgressContext>
  );
}

function LinkPendingReporter() {
  const { pending } = useLinkStatus();
  const reportPending = useStrictContext(NavigationProgressContext);
  const sourceRef = useRef(Symbol('navigation-progress-link'));

  useEffect(() => {
    const source = sourceRef.current;
    reportPending?.(source, pending);

    return () => reportPending?.(source, false);
  }, [pending, reportPending]);

  return null;
}

export { LinkPendingReporter, NavigationProgressProvider };
