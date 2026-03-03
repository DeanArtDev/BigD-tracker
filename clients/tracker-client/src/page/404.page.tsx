import { routes } from '@/shared/lib/routes';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { Button } from '@/shared/ui-kit/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui-kit/ui/card';
import { Input } from '@/shared/ui-kit/ui/input';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft, Search, RefreshCcw } from 'lucide-react';

interface NotFoundPageProps {
  readonly homeHref?: string;
  readonly quickLinks?: Array<{ label: string; to: string }>;
  readonly searchHref?: string;
}

function NotFoundPage({ homeHref = '/', quickLinks = [], searchHref }: NotFoundPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const path = location.pathname + location.search + location.hash;

  const goBack = () => {
    // Если history пустая (прямой заход), уходим домой
    if (window.history.length > 1) navigate(-1);
    else navigate(homeHref, { replace: true });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchHref) return;
    const url = new URL(searchHref, window.location.origin);
    if (q.trim()) url.searchParams.set('q', q.trim());
    navigate(url.pathname + url.search);
  };

  return (
    <div className="min-h-[calc(100vh-2rem)] w-full p-4 sm:p-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border p-2">
                  <Compass className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="truncate">Страница не найдена</CardTitle>
                  <CardDescription className="mt-1">Похоже, такого маршрута нет или он был перемещён.</CardDescription>
                </div>
              </div>

              <Badge variant="outline" className="shrink-0">
                404
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Separator />

            <div className="text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium text-foreground">Путь:</span>
                <code className="rounded bg-muted px-2 py-1 text-xs">{path}</code>
              </div>
            </div>

            {searchHref ? (
              <form onSubmit={onSubmit} className="space-y-2">
                <div className="text-sm font-medium">Попробовать найти</div>
                <div className="flex gap-2">
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск..." className="h-9" />
                  <Button type="submit" variant="secondary" className="gap-2">
                    <Search className="h-4 w-4" />
                    Найти
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">Введи запрос и нажми “Найти”.</div>
              </form>
            ) : (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                Проверь ссылку в адресной строке или перейди на главную.
              </div>
            )}

            {quickLinks.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-medium">Быстрые ссылки</div>
                <div className="flex flex-wrap gap-2">
                  {quickLinks.map((l) => (
                    <Button key={l.to} asChild variant="outline" size="sm">
                      <Link to={l.to} replace>
                        {l.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2">
            <Button variant="default" className="gap-2" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>

            <Button asChild variant="secondary" className="gap-2">
              <Link to={homeHref}>
                <Home className="h-4 w-4" />
                На главную
              </Link>
            </Button>

            <Button variant="ghost" className="gap-2" onClick={() => window.location.reload()}>
              <RefreshCcw className="h-4 w-4" />
              Обновить
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export const Component = () => {
  return (
    <NotFoundPage
      homeHref={routes.home.path}
      quickLinks={[
        { label: 'Планировщик', to: routes.planner.path },
        { label: 'Тренировки', to: routes.gym.path },
      ]}
    />
  );
};
