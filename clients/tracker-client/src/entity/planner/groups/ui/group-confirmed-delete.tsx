import { AlertConfirmDialog } from '@/shared/components/alert-confirm-dialog';
import type { ReactNode } from 'react';
import { useGroupDelete } from '../model';

interface GroupConfirmedDeleteProps {
  readonly groupId: number;
  readonly children: (props: { isLoading: boolean }) => ReactNode;
  readonly onSuccess?: () => void;
}

function GroupConfirmedDelete({ groupId, onSuccess, children }: GroupConfirmedDeleteProps) {
  const { deleteGroup, isPending } = useGroupDelete();

  return (
    <AlertConfirmDialog
      title="Удалить?"
      content="В будущем, можно будет восстановить"
      onConfirm={() => void deleteGroup({ params: { path: { groupId } } }, { onSuccess })}
    >
      {children({ isLoading: isPending })}
    </AlertConfirmDialog>
  );
}

export { GroupConfirmedDelete, type GroupConfirmedDeleteProps };
