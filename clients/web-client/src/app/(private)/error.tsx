'use client';

export default function PrivateError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return 'error';
}
