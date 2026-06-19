'use client';

import { DismissableLayerBranch } from '@radix-ui/react-dismissable-layer';
import { createPortal } from 'react-dom';
import { useIsMobile, useIsMounted } from '@/shared/lib/application-status';
import { Toaster } from '@/shared/ui-kit';

function AppToasterProvider() {
  const isMobile = useIsMobile();

  const isMounted = useIsMounted();
  if (!isMounted) return null;

  return createPortal(
    <DismissableLayerBranch>
      <Toaster
        className="app-toaster z-51 pointer-events-auto"
        richColors
        toastOptions={{ closeButton: true, duration: 5000 }}
        position={isMobile ? 'bottom-center' : 'bottom-right'}
      />
    </DismissableLayerBranch>,
    document.body,
  );
}

function isToasterClosest(evt: CustomEvent) {
  const target = evt.target as HTMLElement;
  return target?.closest('.app-toaster');
}

export { AppToasterProvider, isToasterClosest };
