import { AlertConfirmDialog } from '@/shared/components/alert-confirm-dialog';
import type { ReactNode } from 'react';
import { useDeleteThing } from '../model';

interface DeleteThingProps {
  readonly children: (props: { isLoading: boolean }) => ReactNode;
  readonly thingId: number;
  readonly onSuccess?: () => void;
}

function DeleteTemplate({ thingId, onSuccess, children }: DeleteThingProps) {
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

export { DeleteTemplate, type DeleteThingProps };
