'use client';

import { Button, useSidebar } from '@/shared/ui-kit';

function Test() {
  const { toggleSidebar } = useSidebar();
  return (
    <div>
      <Button onClick={toggleSidebar}>+</Button>
    </div>
  );
}

export { Test };
