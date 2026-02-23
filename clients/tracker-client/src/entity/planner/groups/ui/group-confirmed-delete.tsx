import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import type { ReactNode } from 'react';
import { useGroupDelete } from '../model';

interface GroupConfirmedDeleteProps {
  readonly groupId: number;
  readonly children: (props: { isLoading: boolean; onDelete: () => void }) => ReactNode;
  readonly onSuccess?: () => Promise<void>;
}

function GroupConfirmedDelete({ groupId, onSuccess, children }: GroupConfirmedDeleteProps) {
  const { confirmHolder, viaConfirmation } = useConfirmDialog();
  const { deleteGroup, isPending } = useGroupDelete();

  const handleDelete = () => {
    viaConfirmation({
      isNeedConfirm: () => true,
      callback: () => void deleteGroup({ params: { path: { groupId } } }, { onSuccess }),
      dialog: {
        title: 'Удалить?',
        content: 'В будущем, дело можно будет восстановить',
      },
    });
  };

  return (
    <>
      {children({ isLoading: isPending, onDelete: handleDelete })}
      {confirmHolder}
    </>
  );
}

export { GroupConfirmedDelete, type GroupConfirmedDeleteProps };
