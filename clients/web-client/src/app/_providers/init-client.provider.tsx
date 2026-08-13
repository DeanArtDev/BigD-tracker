'use client';

import { useEffect } from 'react';
import { useNotify } from '@/shared/project-ui';

function InitClientProvider() {
  const { error } = useNotify();
  useEffect(() => {
    import('./init-client-time-locale').catch(() => void error({ message: 'Could not load locale, use default EU' }));
  }, [error]);

  return null;
}

export { InitClientProvider };
