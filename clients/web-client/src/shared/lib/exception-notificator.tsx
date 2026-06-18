'use client';

import { type ReactNode, useEffect, useEffectEvent } from 'react';
import { toast } from 'sonner';
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
) {
  const handler = messageHandlers?.[exception.code] as ((exception: ApiError<Code>) => ReactNode) | undefined;

  return handler?.(exception);
}

function useExceptionNotificator({ exception, messageHandlers }: ExceptionNotificatorProps) {
  const messageHandlersRef = useEffectEvent(() => messageHandlers);

  useEffect(() => {
    if (exception == null) return;
    const handlers = messageHandlersRef();

    toast.error(handleExceptionMessage(exception, handlers) ?? 'Непредвиденная ошибка!');
  }, [exception]);
}

export { useExceptionNotificator, type ExceptionMessageHandlers, type ExceptionNotificatorProps };
