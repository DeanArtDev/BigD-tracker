import { AlertConfirmDialog } from '@/shared/components/alert-confirm-dialog';
import type { ReactNode } from 'react';
import { useDeleteThing } from '../model';

interface ThingDeleteProps {
  readonly children: (props: { isLoading: boolean }) => ReactNode;
  readonly thingId: number;
  readonly onSuccess?: () => void;
}

function ThingDelete({ thingId, onSuccess, children }: ThingDeleteProps) {
  const { deleteThing, isPending } = useDeleteThing();

  return (
    <AlertConfirmDialog
      title="Ты уверен что хочешь удалить?"
      onConfirm={() => void deleteThing({ params: { path: { thingId } } }, { onSuccess })}
    >
      {children({ isLoading: isPending })}
    </AlertConfirmDialog>
  );
}

export { ThingDelete, type ThingDeleteProps };
