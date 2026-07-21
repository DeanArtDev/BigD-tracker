import { GroupId } from '@/entity/planner/groups';
import { useGroupUpdateFeature } from '@/feature/planner/group-update';
import { useWysiwygController, WysiwygEditor } from '@/shared/project-ui';
import { Separator, Typography } from '@/shared/ui-kit';

interface GroupDescriptionProps {
  readonly id: GroupId;
  readonly description?: string;
}

function GroupDescription({ description }: GroupDescriptionProps) {
  const { isGroupUpdateLoading } = useGroupUpdateFeature();
  const { wysiwygController } = useWysiwygController();

  return (
    <div className="flex flex-col h-full grow border-2 rounded-xl">
      <Typography.H5 className="p-3 pb-2">Описание группы</Typography.H5>

      <Separator className="mb-1.5" />

      <WysiwygEditor
        disabled={isGroupUpdateLoading}
        config={{ namespace: 'description', editable: true }}
        state={description}
        placeholder="Опиши группу, для чего она, что она группирует..."
        controller={wysiwygController}
        onDirtyChange={(value) => void console.log(value ? 'Я грязная' : 'Я чистая')}
      />
    </div>
  );
}

export { GroupDescription, type GroupDescriptionProps };
