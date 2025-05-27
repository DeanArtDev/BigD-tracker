import { queryClient } from '@/shared/api/query-client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useMemo, useRef } from 'react';
import { Toaster } from '@/shared/ui-kit/ui/sonner';
import { setDefaultOptions } from 'date-fns';
import { ru } from 'date-fns/locale';
import { SidebarProvider } from '@/shared/ui-kit/ui/sidebar';
import { ZodString, ZodBoolean, z } from 'zod';

setDefaultOptions({ locale: ru });

function useCookie<TSchema extends ZodString | ZodBoolean>(
  key: string,
  schema: TSchema,
): z.output<TSchema> | undefined {
  const schemaRef = useRef(schema);
  schemaRef.current = schema;
  return useMemo(() => {
    const entries = document.cookie
      .split(';')
      .map((x) => x.split('=') as [string, string]);
    const cookieMap = new Map(entries);

    if (schemaRef.current instanceof ZodBoolean && cookieMap.get(key) === 'false') {
      return false;
    }

    const result = schemaRef.current.safeParse(cookieMap.get(key));
    if (result.success) {
      return result.data;
    }
    return undefined;
  }, [document.cookie, key]);
}

export function Providers({ children }: { children: ReactNode }) {
  const sidebarState = useCookie('sidebar_state', z.coerce.boolean());

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools client={queryClient} />
      <SidebarProvider className="bg-sidebar" defaultOpen={sidebarState}>
        {children}
      </SidebarProvider>
      <Toaster richColors />
    </QueryClientProvider>
  );
}
