'use client';

import { ReactNode, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIsMounted } from '@/shared/lib/application-status';
import { confirmDialogContext } from './confirm-dialog.context';

function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null);
  const value = useMemo(() => ({ setContent }), [setContent]);

  const isMounted = useIsMounted();
  if (!isMounted) return null;

  return (
    <confirmDialogContext.Provider value={value}>
      {children}
      {content && createPortal(content, document.body)}
    </confirmDialogContext.Provider>
  );
}

export { ConfirmDialogProvider };
