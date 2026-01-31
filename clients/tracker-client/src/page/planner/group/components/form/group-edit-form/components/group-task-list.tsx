import { TaskFrame } from '@/entity/planner/tasks/ui';
import { Typography } from '@/shared/components/typography';
import { VerticalDnD } from '@/shared/components/vertical-dnd';
import { pluralize } from '@/shared/lib/utils/pluralize';
import { Button } from '@/shared/ui-kit/ui/button';
import { ScrollAreaNativeVertical } from '@/shared/ui-kit/ui/scroll-area-native-vertical';
import { cn } from '@/shared/ui-kit/utils';
import { GripVertical } from 'lucide-react';
import { type FieldArrayPath, useFieldArray } from 'react-hook-form';
import type { GroupEditFormData } from '../validation-schema';

function GroupTaskList() {
  const { fields: tasks, move } = useFieldArray<
    { tasks: GroupEditFormData['tasks'] },
    FieldArrayPath<{ tasks: GroupEditFormData['tasks'] }>,
    'formUid'
  >({
    name: 'tasks',
    keyName: 'formUid',
  });

  const header = `В группе ${tasks.length} ${pluralize(tasks.length, { one: 'дело', few: 'дела', many: 'дел' })}`;

  return (
    <ScrollAreaNativeVertical className="px-2 lg:pr-0">
      <div className="flex flex-col grow min-h-0 min-w-0">
        <Typography.H4 className="text-base mb-3">{header}</Typography.H4>

        <VerticalDnD
          items={tasks}
          className="gap-2"
          getId={(task) => task.formUid}
          onChange={({ oldIndex, newIndex }) => void move(oldIndex, newIndex)}
          renderItem={({ item: task, setNodeRef, isDragging, style, handleProps }) => {
            return (
              <TaskFrame
                key={task.id}
                style={style}
                className={cn('relative pl-6 sm:pl-6 select-none', { 'select-none': isDragging })}
                ref={setNodeRef}
                name={task.name}
                priority={task.priority}
                beforeNameSlot={
                  <Button
                    type="button"
                    variant="ghost"
                    {...handleProps}
                    className={cn('size-5 absolute top-50% left-0', handleProps.className)}
                  >
                    <GripVertical />
                  </Button>
                }
                onClick={() => console.log(444)}
              />
            );
          }}
        />
      </div>
    </ScrollAreaNativeVertical>
  );
}

export { GroupTaskList };
