'use client';

import { AppError } from '@/shared/error-handling';

export default function PrivateError(props: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <AppError error={props.error} reset={props.unstable_retry} />;
}
