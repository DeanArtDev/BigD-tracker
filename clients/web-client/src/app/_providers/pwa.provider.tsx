'use client';

import { useEffect } from 'react';
import { getEnvConfigClient } from '@/shared/lib';

const clientConfig = getEnvConfigClient();

function PwaProvider() {
  useEffect(() => {
    if (!clientConfig.IS_PROD || !('serviceWorker' in navigator)) return;

    void navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => undefined);
  }, []);

  return null;
}

export { PwaProvider };
