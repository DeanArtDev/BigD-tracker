import { useTaskFromContext } from '@/entity/planner/tasks';
import { SelectItem, Typography } from '@/shared/ui-kit';
import { SelectForm } from '@/shared/ui-kit/form';

function Group() {
  const { fieldVisibility } = useTaskFromContext();

  if (!fieldVisibility?.groupSelection) return null;
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-2 items-center">
      <Typography.H6 className="font-medium">Группа</Typography.H6>

      <SelectForm classNames={{ trigger: 'bg-background' }} name="groupId" placeholder="Без группы">
        <SelectItem value={'0'}>Без группы</SelectItem>
        <SelectItem value={'1'}>Group 1</SelectItem>
      </SelectForm>
    </div>
  );
}

export { Group };
