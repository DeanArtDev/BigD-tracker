import { debounce } from 'lodash-es';
import { useRef } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { useGroupUpdateFeature } from '@/feature/planner/group-update';
import { useWysiwygController, WysiwygEditor } from '@/shared/project-ui';
import { DataLoader, Separator, Typography, useLoadingStatus } from '@/shared/ui-kit';
import { useGetDetailedGroupSuspense } from '../../_api';

interface GroupDescriptionProps {
  readonly groupId: GroupId;
}

const SAVE_DELAY_TIME = 3000;

function GroupDescription({ groupId }: GroupDescriptionProps) {
  const { updateGroup } = useGroupUpdateFeature();
  const { group } = useGetDetailedGroupSuspense({ groupId });

  const initialValueRef = useRef(group?.description);

  const { wysiwygController } = useWysiwygController();

  const { loadingStatus, setLoadingStatus, setSuccessStatus, setErrorStatus } = useLoadingStatus();
  const debouncedUpdate = debounce(async () => {
    if (group != null) {
      try {
        setLoadingStatus();
        const value = wysiwygController.current?.getStateAsString?.();
        await updateGroup(
          { id: group.id, name: group.name, description: value ?? null, taskIds: undefined },
          { showToast: false },
        );
        setSuccessStatus();
      } catch {
        setErrorStatus();
      }
    }
  }, SAVE_DELAY_TIME);

  return (
    <div className="flex flex-col h-full grow border-2 rounded-xl">
      <Typography.H5 className="flex p-3 pb-2 justify-between items-center">
        <span>Описание группы</span>

        <DataLoader.StatusLoading status={loadingStatus} />
      </Typography.H5>

      <Separator className="mb-1.5" />

      <WysiwygEditor
        controller={wysiwygController}
        state={initialValueRef.current}
        config={{ namespace: 'description', editable: true }}
        placeholder="Опиши группу, для чего она, что она группирует..."
        onStateChange={debouncedUpdate}
      />
    </div>
  );
}

export { GroupDescription };
