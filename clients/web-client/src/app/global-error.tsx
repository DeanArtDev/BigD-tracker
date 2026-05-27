'use client';

import { AppShellProvider } from '@/app/_providers/app-shell-provider';
import { AppError } from '@/shared/error-handling';

export default function GlobalError(props: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <AppShellProvider>
      <AppError error={props.error} reset={props.unstable_retry} />
    </AppShellProvider>
  );
}
