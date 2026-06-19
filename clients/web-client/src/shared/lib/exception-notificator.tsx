'use client';

import { type ReactNode, useEffect, useEffectEvent } from 'react';
import { useNotify } from '@/shared/lib/use-notify';
import { ApiError, ApiErrorCode } from '@/shared/transport/graphql';

type ExceptionMessageHandlers = Partial<{
  [Code in ApiErrorCode]: (exception: ApiError<Code>) => ReactNode;
}>;

interface ExceptionNotificatorProps {
  readonly exception: ApiError | undefined;
  readonly messageHandlers?: ExceptionMessageHandlers;
}

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

    error({ message: handleExceptionMessage(exception, handlers) ?? 'Непредвиденная ошибка!' });
  }, [exception, error]);
}

export { useExceptionNotificator, type ExceptionMessageHandlers, type ExceptionNotificatorProps };
