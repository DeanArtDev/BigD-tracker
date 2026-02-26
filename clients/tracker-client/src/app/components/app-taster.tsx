import { useIsMobile } from '@/shared/ui-kit/helpers';
import { Toaster } from '@/shared/ui-kit/ui/sonner';
import { DismissableLayerBranch } from '@radix-ui/react-dismissable-layer';
import { createPortal } from 'react-dom';

function AppTaster() {
  const isMobile = useIsMobile();

  return createPortal(
    <DismissableLayerBranch>
      <Toaster
        richColors
        className="z-51 pointer-events-auto"
        position={isMobile ? 'bottom-center' : 'top-center'}
      />
    </DismissableLayerBranch>,
    document.body,
  );
}

export { AppTaster };
