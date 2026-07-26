import { TriangleAlert } from 'lucide-react';
import type { Metadata } from 'next';
import { AppLink } from '@/shared/project-ui';
import { routes } from '@/shared/routes';
import { Button, Typography } from '@/shared/ui-kit';
import { Main } from '../_ui/main';

export const metadata: Metadata = {
  title: 'Что-то пошло не так',
  description: 'Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.',
};

export default function ErrorPage() {
  return (
    <Main>
      <section className="flex m-auto flex-col items-center gap-6 text-center">
        <div
          aria-hidden
          className="bg-linear-to-br from-primary/15 to-chart-3/15 text-primary flex size-28 items-center justify-center rounded-full"
        >
          <TriangleAlert className="size-14" strokeWidth={1.75} />
        </div>

        <p
          aria-hidden
          className="bg-linear-to-br from-primary to-chart-3 bg-clip-text text-[88px] font-extrabold leading-none tracking-tight text-transparent sm:text-[112px]"
        >
          Упс
        </p>

        <Typography.H1 className="text-3xl sm:text-4xl">Что-то пошло не так</Typography.H1>

        <Typography.Muted className="max-w-[440px]">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную. Если проблема
          повторяется — сообщите нам.
        </Typography.Muted>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <AppLink href={routes.home.path}>На главную</AppLink>
          </Button>
        </div>
      </section>
    </Main>
  );
}
