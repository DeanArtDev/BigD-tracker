import { AlertConfirmDialog } from '@/shared/components/alert-confirm-dialog';
import type { ReactNode } from 'react';
import { useGroupDelete } from '../model';

interface GroupDeleteProps {
  readonly groupId: number;
  readonly children: (props: { isLoading: boolean }) => ReactNode;
  readonly onSuccess?: () => void;
}

function GroupDelete({ groupId, onSuccess, children }: GroupDeleteProps) {
  const { deleteGroup, isPending } = useGroupDelete();

  return (
    <AlertConfirmDialog
      title="Ты уверен что хочешь удалить?"
      onConfirm={() => void deleteGroup({ params: { path: { groupId } } }, { onSuccess })}
    >
      {children({ isLoading: isPending })}
    </AlertConfirmDialog>
  );
}

export { GroupDelete, type GroupDeleteProps };
