import { Badge } from '@/shared/ui-kit/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui-kit/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui-kit/ui/collapsible';
import { ScrollArea } from '@/shared/ui-kit/ui/scroll-area';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { type ReactNode, useMemo, useState } from 'react';
import { isRouteErrorResponse, useLocation, useRouteError } from 'react-router-dom';
import { AlertTriangle, Bug, Clipboard, Home, RefreshCcw, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/shared/ui-kit/ui/button';
import { toast } from 'sonner';
import { ContentWrapper } from '@/shared/components/content-wrapper';

interface RouterErrorBoundaryProps {
  homeHref?: string;
  defaultShowDetails?: boolean;
  supportHint?: ReactNode;
}

function normalizeUnknownError(err: unknown) {
  if (err instanceof Error) {
    return {
      kind: 'error' as const,
      title: 'Что-то пошло не так',
      subtitle: err.message || 'Неизвестная ошибка',
      status: undefined as number | undefined,
      statusText: undefined as string | undefined,
      stack: err.stack,
      raw: err,
    };
  }

  const asAny = err as any;
  const msg = typeof asAny?.message === 'string' ? asAny.message : typeof err === 'string' ? err : 'Неизвестная ошибка';

  return {
    kind: 'unknown' as const,
    title: 'Ошибка приложения',
    subtitle: msg,
    status: typeof asAny?.status === 'number' ? asAny.status : undefined,
    statusText: typeof asAny?.statusText === 'string' ? asAny.statusText : undefined,
    stack: typeof asAny?.stack === 'string' ? asAny.stack : undefined,
    raw: err,
  };
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(
      value,
      (_key, val) => {
        if (val instanceof Error) {
          return {
            name: val.name,
            message: val.message,
            stack: val.stack,
          };
        }
        return val;
      },
      2,
    );
  } catch {
    return String(value);
  }
}

function statusTone(status?: number) {
  if (!status) return 'default' as const;
  if (status >= 500) return 'destructive' as const;
  if (status === 401 || status === 403) return 'secondary' as const;
  if (status === 404) return 'outline' as const;
  if (status >= 400) return 'secondary' as const;
  return 'default' as const;
}

function pickIcon(status?: number) {
  if (status === 401 || status === 403) return ShieldAlert;
  if (status && status >= 500) return Bug;
  return AlertTriangle;
}

function RouterErrorBoundary(props: RouterErrorBoundaryProps) {
  const { homeHref = '/', defaultShowDetails = false, supportHint } = props;

  const routeError = useRouteError();
  const location = useLocation();

  const [open, setOpen] = useState(defaultShowDetails);

  const model = useMemo(() => {
    if (isRouteErrorResponse(routeError)) {
      // Это стандартный RouteErrorResponse (thrown Response/redirect/data router errors)
      const status = routeError.status;
      const statusText = routeError.statusText;
      // data может быть string/object (в зависимости от того, что вернули/кинули)
      const dataText =
        typeof routeError.data === 'string'
          ? routeError.data
          : routeError.data
            ? safeStringify(routeError.data)
            : undefined;

      const title =
        status === 404
          ? 'Страница не найдена'
          : status === 401
            ? 'Нужно войти'
            : status === 403
              ? 'Доступ запрещён'
              : status >= 500
                ? 'Ошибка сервера'
                : 'Ошибка запроса';

      const subtitle = dataText || statusText || 'Произошла ошибка при загрузке страницы.';

      return {
        kind: 'route' as const,
        title,
        subtitle,
        status,
        statusText,
        stack: undefined as string | undefined,
        raw: routeError,
      };
    }

    return normalizeUnknownError(routeError);
  }, [routeError]);

  const Icon = pickIcon(model.status);

  const meta = useMemo(() => {
    return {
      path: location.pathname + location.search + location.hash,
      ts: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
  }, [location]);

  const detailsPayload = useMemo(() => {
    return safeStringify({
      meta,
      error: model.raw,
    });
  }, [meta, model.raw]);

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(detailsPayload);
      toast('Скопировано', { description: 'Детали ошибки скопированы в буфер обмена.' });
    } catch {
      toast('Не получилось скопировать', {
        description: 'Браузер запретил доступ к буферу обмена.',
      });
    }
  };

  return (
    <ContentWrapper className="md:pl-0">
      <div className="min-h-[calc(100vh-2rem)] w-full p-4 sm:p-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{model.title}</CardTitle>
                    <CardDescription className="mt-1">{model.subtitle}</CardDescription>
                  </div>
                </div>

                {model.status ? (
                  <Badge variant={statusTone(model.status)} className="shrink-0">
                    {model.status}
                    {model.statusText ? ` ${model.statusText}` : ''}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Separator />

              <div className="text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium text-foreground">Путь:</span>
                  <code className="rounded bg-muted px-2 py-1 text-xs">{meta.path}</code>
                </div>
              </div>

              {supportHint ? (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">{supportHint}</div>
              ) : (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                  Попробуй обновить страницу. Если ошибка повторяется — скопируй детали и отправь в поддержку/в
                  баг-трекер.
                </div>
              )}

              <Collapsible open={open} onOpenChange={setOpen}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Технические детали</div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      {open ? (
                        <>
                          Скрыть <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Показать <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={copyDetails} className="gap-2">
                      <Clipboard className="h-4 w-4" />
                      Копировать детали
                    </Button>
                  </div>

                  <div className="mt-3 rounded-lg border">
                    <ScrollArea className="h-56">
                      <pre className="p-3 text-xs leading-relaxed">
                        {detailsPayload}
                        {model.stack ? `\n\nstack:\n${model.stack}` : ''}
                      </pre>
                    </ScrollArea>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
              <Button variant="default" className="gap-2" onClick={() => window.location.reload()}>
                <RefreshCcw className="h-4 w-4" />
                Обновить
              </Button>

              <Button asChild variant="secondary" className="gap-2">
                <a href={homeHref}>
                  <Home className="h-4 w-4" />
                  На главную
                </a>
              </Button>
            </CardFooter>
          </Card>

          <div className="text-center text-xs text-muted-foreground">тут будет correlationId, но попозже, отвечаю!</div>
        </div>
      </div>
    </ContentWrapper>
  );
}

export { RouterErrorBoundary };
