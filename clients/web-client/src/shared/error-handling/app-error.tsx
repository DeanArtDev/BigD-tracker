'use client';

import { Home, RefreshCw, TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { getEnvConfigClient } from '@/shared/lib';
import { AppLink } from '@/shared/project-ui';
import { routes } from '@/shared/routes';
import { isApiError } from '@/shared/transport/graphql';
import { Button, Typography } from '@/shared/ui-kit';
import { CopyCorrelationIdButton } from './copy-correlation-id-button';
import { ErrorDetails } from './error-details';

const clientConfig = getEnvConfigClient();
const SHOW_SENSITIVE = clientConfig.IS_DEV || clientConfig.IS_TEST;

interface AppErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset?: () => void;
}

function AppError({ error, reset }: AppErrorProps) {
  const apiError = isApiError(error) ? error : null;
  const correlationId = apiError?.correlationId && apiError.correlationId !== 'n/a' ? apiError.correlationId : null;

  useEffect(() => {
    console.error('[AppError]', error);
  }, [error]);

  function handleReload() {
    if (reset) {
      reset();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  return (
    <section role="alert" aria-live="assertive" className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 p-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <div
          aria-hidden
          className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"
        >
          <TriangleAlert className="size-8" strokeWidth={1.75} />
        </div>
        <Typography.H2>Технические неполадки</Typography.H2>
        <Typography.Muted className="max-w-[440px]">
          Что-то пошло не так на нашей стороне. Попробуйте перезагрузить страницу или вернуться на главную. Если
          проблема повторяется — сообщите нам и приложите ID запроса.
        </Typography.Muted>
      </header>

      {correlationId ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
          <div className="flex min-w-0 flex-col">
            <Typography.Small className="text-muted-foreground">ID запроса</Typography.Small>
            <Typography.Code className="truncate">{correlationId}</Typography.Code>
          </div>
          <CopyCorrelationIdButton correlationId={correlationId} />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" onClick={handleReload}>
          <RefreshCw />
          Перезагрузить страницу
        </Button>
        <Button asChild variant="outline">
          <AppLink href={routes.home.path}>
            <Home />
            На главную
          </AppLink>
        </Button>
      </div>

      {SHOW_SENSITIVE ? <ErrorDetails error={error} apiError={apiError} /> : null}
    </section>
  );
}

export { AppError };
