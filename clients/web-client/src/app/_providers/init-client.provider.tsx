'use client';

import { useEffect } from 'react';

function InitClientProvider() {
  useEffect(() => {
    import('@/shared/lib/time/locales');
  }, []);

  return null;
}

export { InitClientProvider };
