'use client';

import { ReactNode, use } from 'react';

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function Delay({ ms = 3000, children }: { ms?: number; children: ReactNode }) {
  use(sleep(ms));

  return children;
}

export { Delay };
