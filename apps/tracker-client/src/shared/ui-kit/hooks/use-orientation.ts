import { useEffect, useState } from 'react';

export function useOrientation() {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(() =>
    window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape',
  );

  useEffect(() => {
    const mql = window.matchMedia('(orientation: portrait)');

    const handler = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? 'portrait' : 'landscape');
    };

    mql.addEventListener('change', handler);

    return () => void mql.removeEventListener('change', handler);
  }, []);

  return {
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
  };
}
