import { ReactNode } from 'react';
import { createStrictContext, useStrictContext } from '@/shared/lib';

interface ConfirmDialogContext {
  setContent: (content: ReactNode | null) => void;
}

const confirmDialogContext = createStrictContext<ConfirmDialogContext>();

const useConfirmDialogContext = () => useStrictContext<ConfirmDialogContext>(confirmDialogContext);

export { confirmDialogContext, useConfirmDialogContext, type ConfirmDialogContext };
