import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button, cn, Typography } from '@/shared/ui-kit';

export const metadata: Metadata = {
  title: '404 — Страница не найдена',
  description: 'Запрошенная страница не существует или была перемещена.',
};

export default function NotFound() {
  return (
    <main className={cn('grid min-h-dvh place-items-center px-6 py-12')}>
      <section className="flex w-full max-w-[560px] flex-col items-center gap-6 text-center">
        <Link href="/" aria-label="На главную">
          <Image className="rounded-lg" src="/big-d-logo.png" width={60} height={28} alt="" loading="eager" priority />
        </Link>

        <p
          aria-hidden
          className="bg-linear-to-br from-primary to-chart-3 bg-clip-text text-[120px] font-extrabold leading-none tracking-tight text-transparent sm:text-[160px]"
        >
          404
        </p>

        <Typography.H1 className="text-3xl sm:text-4xl">Страница не найдена</Typography.H1>

        <Typography.Muted className="max-w-[440px]">
          Возможно, ссылка устарела, страница была перемещена или вы ввели адрес с опечаткой.
        </Typography.Muted>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
