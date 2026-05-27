import { ApiError } from '@/shared/transport/graphql';
import { ScrollArea, ScrollBar, Separator, Typography } from '@/shared/ui-kit';

interface Props {
  readonly error: Error & { digest?: string };
  readonly apiError: ApiError | null;
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function ErrorDetails({ error, apiError }: Props) {
  const rows = apiError
    ? [
        { label: 'type', value: 'ApiError' },
        { label: 'key', value: apiError.key },
        { label: 'code', value: apiError.code },
        { label: 'correlationId', value: apiError.correlationId },
        { label: 'message', value: apiError.message },
        apiError.path ? { label: 'path', value: formatJson(apiError.path) } : null,
        apiError.details ? { label: 'details', value: formatJson(apiError.details) } : null,
        error.digest ? { label: 'digest', value: error.digest } : null,
        error.stack ? { label: 'stack', value: error.stack } : null,
      ].filter((row): row is { label: string; value: string } => row !== null)
    : [
        { label: 'type', value: error.name || 'Error' },
        { label: 'message', value: error.message || '—' },
        error.digest ? { label: 'digest', value: error.digest } : null,
        error.stack ? { label: 'stack', value: error.stack } : null,
        'cause' in error && error.cause != null ? { label: 'cause', value: formatJson(error.cause) } : null,
      ].filter((row): row is { label: string; value: string } => row !== null);

  return (
    <section
      aria-label="Технические детали ошибки"
      className="overflow-hidden rounded-xl border border-destructive/40 bg-destructive/5"
    >
      <header className="flex items-center justify-between gap-2 border-b border-destructive/40 bg-destructive/10 px-3 py-2">
        <Typography.Small className="font-medium text-destructive">
          Технические детали {apiError ? '(ApiError)' : `(${error.name || 'Error'})`}
        </Typography.Small>
        <Typography.Small className="text-muted-foreground">видно только в dev/test</Typography.Small>
      </header>

      <ScrollArea className="max-h-[50vh] w-full">
        <div className="min-w-max p-3">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 font-mono text-xs">
            {rows.map((row, index) => (
              <div key={row.label} className="contents">
                <dt className="pt-0.5 text-muted-foreground">{row.label}</dt>
                <dd className="whitespace-pre text-foreground">{row.value}</dd>
                {index < rows.length - 1 ? (
                  <>
                    <Separator className="col-span-2 my-1 bg-destructive/20" />
                  </>
                ) : null}
              </div>
            ))}
          </dl>
        </div>
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </section>
  );
}

export { ErrorDetails };
