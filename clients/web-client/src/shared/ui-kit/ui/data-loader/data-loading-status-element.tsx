'use client';

import { Check, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/ui-kit';
import { DataLoadingElement } from './data-loading-element';

type LoadingStatusValue = 'idle' | 'loading' | 'success' | 'error';

type ResultAnimationPhase = 'idle' | 'enter' | 'peak' | 'exit';

interface LoadingStatusProps {
  status: LoadingStatusValue;
  className?: string;
  size?: number;

  /** Продолжительность уменьшения иконки от пикового до минимального размера. */
  resultVisibleDuration?: number;
}

const ENTER_DURATION = 800;
const DEFAULT_RESULT_VISIBLE_DURATION = ENTER_DURATION;

function useLoadingStatus(resultVisibleDuration = DEFAULT_RESULT_VISIBLE_DURATION) {
  const [status, setStatus] = useState<LoadingStatusValue>('idle');
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current !== undefined) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => clearIdleTimeout, [clearIdleTimeout]);

  const setIdleStatus = useCallback(() => {
    clearIdleTimeout();
    setStatus('idle');
  }, [clearIdleTimeout]);

  const setLoadingStatus = useCallback(() => {
    clearIdleTimeout();
    setStatus('loading');
  }, [clearIdleTimeout]);

  const setResultStatus = useCallback(
    (resultStatus: Extract<LoadingStatusValue, 'success' | 'error'>) => {
      clearIdleTimeout();
      setStatus(resultStatus);

      idleTimeoutRef.current = setTimeout(() => {
        idleTimeoutRef.current = undefined;
        setStatus((currentStatus) => (currentStatus === resultStatus ? 'idle' : currentStatus));
      }, ENTER_DURATION + resultVisibleDuration);
    },
    [clearIdleTimeout, resultVisibleDuration],
  );

  const setSuccessStatus = useCallback(() => setResultStatus('success'), [setResultStatus]);
  const setErrorStatus = useCallback(() => setResultStatus('error'), [setResultStatus]);

  return { loadingStatus: status, setLoadingStatus, setSuccessStatus, setErrorStatus, setIdleStatus };
}

function LoadingStatus({
  status,
  className,
  size = 20,
  resultVisibleDuration = DEFAULT_RESULT_VISIBLE_DURATION,
}: LoadingStatusProps) {
  const [visibleStatus, setVisibleStatus] = useState<LoadingStatusValue>(status);
  const [phase, setPhase] = useState<ResultAnimationPhase>(
    status === 'success' || status === 'error' ? 'enter' : 'idle',
  );

  const animationIdRef = useRef(0);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (status === 'loading') {
        setVisibleStatus('loading');
        setPhase('idle');

        return;
      }

      if (status === 'idle') {
        setVisibleStatus((currentStatus) =>
          currentStatus === 'success' || currentStatus === 'error' ? currentStatus : 'idle',
        );

        return;
      }

      setPhase('enter');
      setVisibleStatus(status);
    });

    return () => cancelAnimationFrame(frameId);
  }, [status]);

  useEffect(() => {
    if (visibleStatus !== 'success' && visibleStatus !== 'error') {
      return;
    }

    animationIdRef.current += 1;

    const currentAnimationId = animationIdRef.current;
    const timeouts: Array<ReturnType<typeof setTimeout>> = [];
    let frameId: number | undefined = undefined;

    const isCurrentAnimation = () => animationIdRef.current === currentAnimationId;

    frameId = requestAnimationFrame(() => {
      if (!isCurrentAnimation()) {
        return;
      }

      setPhase('peak');
    });

    timeouts.push(
      setTimeout(() => {
        if (!isCurrentAnimation()) {
          return;
        }

        setPhase('exit');
      }, ENTER_DURATION),
    );

    return () => {
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }

      timeouts.forEach(clearTimeout);
    };
  }, [visibleStatus, resultVisibleDuration]);

  const isLoading = visibleStatus === 'loading';
  const isResult = visibleStatus === 'success' || visibleStatus === 'error';

  const ResultIcon = visibleStatus === 'error' ? X : Check;

  return (
    <span
      className={cn('relative ml-auto inline-flex shrink-0 items-center justify-center', className)}
      style={{
        width: size,
        height: size,
      }}
      role="status"
      aria-live="polite"
      aria-label={getStatusLabel(visibleStatus)}
    >
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          'transition-[opacity,transform] duration-150 ease-out',
          isLoading ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0',
        )}
      >
        <DataLoadingElement className="m-0 stroke-gray-400" size={size} />
      </span>

      {isResult && (
        <ResultIcon
          size={size}
          strokeWidth={2.5}
          onTransitionEnd={(event) => {
            if (phase === 'exit' && event.propertyName === 'opacity') {
              setVisibleStatus('idle');
              setPhase('idle');
            }
          }}
          style={{
            transitionDuration: `${phase === 'exit' ? resultVisibleDuration : ENTER_DURATION}ms`,
          }}
          className={cn(
            'absolute transition-[opacity,transform] ease-in-out',
            visibleStatus === 'success' ? 'stroke-emerald-500' : 'stroke-red-500',

            phase === 'enter' && 'scale-110 opacity-0',

            phase === 'peak' && 'scale-125 opacity-100',

            phase === 'exit' && 'scale-0 opacity-0',
          )}
        />
      )}
    </span>
  );
}

function getStatusLabel(status: LoadingStatusValue): string | undefined {
  switch (status) {
    case 'loading':
      return 'Загрузка';

    case 'success':
      return 'Успешно';

    case 'error':
      return 'Произошла ошибка';

    case 'idle':
      return undefined;
  }
}

export { useLoadingStatus, LoadingStatus, type LoadingStatusValue };
