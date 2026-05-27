'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function Navigate(props: { path: string }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const returnTo = encodeURIComponent(pathname);
    router.replace(`${props.path}?returnTo=${returnTo}`);
  }, [router, pathname, props.path]);

  return null;
}

export { Navigate };
