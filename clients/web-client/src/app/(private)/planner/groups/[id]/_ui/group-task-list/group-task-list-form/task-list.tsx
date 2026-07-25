import { Link2Off } from 'lucide-react';
import { type FieldArrayPath, useFieldArray } from 'react-hook-form';
import { TaskCard, TaskId } from '@/entity/planner/tasks';
import { AppTooltip, VerticalDnD } from '@/shared/project-ui';
import { Button, cn } from '@/shared/ui-kit';
import { GroupTaskListSchemaFormData } from './group-task-list.form';

interface TaskListProps {
  readonly loadingTaskId?: TaskId;
  readonly onHeaderClick: (task: GroupTaskListSchemaFormData['tasks'][0]) => void;
  readonly onContentClick: (task: GroupTaskListSchemaFormData['tasks'][0]) => void;
  readonly onUnassign: (task: GroupTaskListSchemaFormData['tasks'][0]) => void;
}

function TaskList({ loadingTaskId, onContentClick, onHeaderClick, onUnassign }: TaskListProps) {
  const { fields: tasks, move } = useFieldArray<
    { tasks: GroupTaskListSchemaFormData['tasks'] },
    FieldArrayPath<{ tasks: GroupTaskListSchemaFormData['tasks'] }>,
    'formUid'
  >({
    name: 'tasks',
    keyName: 'formUid',
  });

  return (
    <VerticalDnD
      items={tasks}
      className="gap-2"
      getId={(task) => task.formUid}
      onChange={({ oldIndex, newIndex }) => void move(oldIndex, newIndex)}
      renderItem={({ item: task, setNodeRef, style, isDragging, handleProps }) => {
        const disabledVariant = loadingTaskId === task.id;
        const disableDragging = isDragging || tasks.length <= 1 || disabledVariant;

        return (
          <div style={style} {...(disableDragging ? {} : handleProps)} ref={setNodeRef}>
            <TaskCard
              variant={disabledVariant ? 'disabled' : 'default'}
              id={task.id as TaskId}
              className="group/task-card-wrapper"
              priority={task.priority}
              status={task.status}
              name={task.name}
              deadline={task.deadline ?? undefined}
              afterHeaderSlot={({ variant }) => {
                const isDisabled = variant === 'disabled';

                return (
                  <AppTooltip content="Отвязать дело от группы" disable={isDisabled} delayDuration={1500}>
                    <Button
                      className={cn({
                        'opacity-0!': isDisabled,
                        'opacity-0 transition-opacity group-hover/task-card-wrapper:opacity-100': !isDisabled,
                      })}
                      size="icon-sm"
                      aria-hidden={isDisabled}
                      disabled={isDisabled}
                      variant="ghost"
                      onKeyDown={(evt) => {
                        evt.stopPropagation();
                        evt.preventDefault();
                      }}
                      onTouchStart={(evt) => {
                        evt.stopPropagation();
                        evt.preventDefault();
                      }}
                      onPointerDown={(evt) => {
                        evt.stopPropagation();
                        evt.preventDefault();
                      }}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        evt.preventDefault();
                        onUnassign(task);
                      }}
                    >
                      <Link2Off className="stroke-muted-foreground" />
                    </Button>
                  </AppTooltip>
                );
              }}
              onContentClick={() => void onContentClick(task)}
              onHeaderClick={() => void onHeaderClick(task)}
            />
          </div>
        );
      }}
    />
  );
}

export { TaskList, type TaskListProps };
