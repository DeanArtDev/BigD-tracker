'use client';

import { type ReactNode, useEffect, useEffectEvent } from 'react';
import { useOnUnmount } from '@/shared/lib/application-status';
import { ApiError, ApiErrorCode } from '@/shared/transport/graphql';
import { useNotify } from '../project-ui';

type ExceptionMessageHandlers = Partial<{
  [Code in ApiErrorCode]: (exception: ApiError<Code>) => ReactNode;
}>;

interface ExceptionNotificatorProps {
  readonly exception: ApiError | undefined;
  readonly messageHandlers?: ExceptionMessageHandlers;
}

const shownExceptionSet = new Set<ApiErrorCode>();

function handleExceptionMessage<Code extends ApiErrorCode>(
  exception: ApiError<Code>,
  messageHandlers: ExceptionMessageHandlers | undefined,
): ReactNode {
  const handler = messageHandlers?.[exception.code] as ((exception: ApiError<Code>) => ReactNode) | undefined;

  return handler?.(exception);
}

function useExceptionNotificator({ exception, messageHandlers }: ExceptionNotificatorProps) {
  const messageHandlersRef = useEffectEvent(() => messageHandlers);
  const { error } = useNotify();

  useEffect(() => {
    if (exception == null) return;
    const handlers = messageHandlersRef();

    if (shownExceptionSet.has(exception.code)) return;
    shownExceptionSet.add(exception.code);
    error({
      message: handleExceptionMessage(exception, handlers) ?? 'Непредвиденная ошибка!',
      onDismiss: () => void shownExceptionSet.delete(exception.code),
      onAutoClose: () => void shownExceptionSet.delete(exception.code),
    });
  }, [exception, error]);

  useOnUnmount(() => void shownExceptionSet.clear());
}

export { useExceptionNotificator, type ExceptionMessageHandlers, type ExceptionNotificatorProps };
