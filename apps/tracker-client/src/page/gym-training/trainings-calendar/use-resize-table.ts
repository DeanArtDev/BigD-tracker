import { useOrientation } from '@/shared/ui-kit/hooks/use-orientation';
import { useSidebarStore } from '@/shared/ui-kit/hooks/use-sidebar-storage';
import { debounce } from 'lodash-es';
import { useEffect, useRef } from 'react';

function useResizeTable({ onResize }: { onResize: () => void }) {
  const { isLandscape } = useOrientation();
  const { sidebar_state: sidebarState } = useSidebarStore();

  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  useEffect(() => {
    debounce(onResizeRef.current, 300)();
  }, [sidebarState, isLandscape]);
}

export { useResizeTable };
