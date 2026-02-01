import { getTasksStatusCount } from '@/entity/planner/tasks/lib';
import { TaskFrame } from '@/entity/planner/tasks/ui';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import { Typography } from '@/shared/components/typography';
import { VerticalDnD } from '@/shared/components/vertical-dnd';
import { pluralize } from '@/shared/lib/utils/pluralize';
import { Button } from '@/shared/ui-kit/ui/button';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { ScrollAreaNativeVertical } from '@/shared/ui-kit/ui/scroll-area-native-vertical';
import { cn } from '@/shared/ui-kit/utils';
import { CircleCheckBig, CirclePause, CirclePlus, GripVertical } from 'lucide-react';
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

  const { total, notStarted, overdue, done } = getTasksStatusCount(tasks);
  const header = `В группе ${total} ${pluralize(total, { one: 'дело', few: 'дела', many: 'дел' })}`;

  return (
    <ScrollAreaNativeVertical className="px-2 lg:pr-0">
      <div className="flex flex-col grow min-h-0 min-w-0">
        <DataLoader
          isEmpty={total === 0}
          emptyElement={
            <AppEmptyPlaceholder
              className="m-auto"
              size="small"
              message="В группе еще нет дел, добавить?"
              afterEndSlot={
                <Button className="mt-2" size="sm" type="button" variant="outline">
                  Создать
                </Button>
              }
            />
          }
        >
          <div className="inline-flex items-center justify-between gap-2 mb-3 flex-wrap">
            <Typography.H4 className="text-base ">{header}</Typography.H4>

            <ul className="inline-flex gap-2">
              <li className="inline-flex items-center gap-1">
                <CircleCheckBig className="size-5 stroke-green-600" />
                <Typography.Small>{done}</Typography.Small>
              </li>

              <li className="inline-flex items-center gap-1">
                <CirclePause className="size-5 stroke-gray-400" />
                <Typography.Small>{notStarted}</Typography.Small>
              </li>

              <li className="inline-flex items-center gap-1">
                <CirclePlus className="size-5 stroke-red-500 rotate-45" />
                <Typography.Small>{overdue}</Typography.Small>
              </li>
            </ul>
          </div>

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
        </DataLoader>
      </div>
    </ScrollAreaNativeVertical>
  );
}

export { GroupTaskList };
