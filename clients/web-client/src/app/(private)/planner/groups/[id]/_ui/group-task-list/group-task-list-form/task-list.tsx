import { Link2Off } from 'lucide-react';
import { type FieldArrayPath, useFieldArray } from 'react-hook-form';
import { TaskActionsDropdown, TaskCard, TaskDomain, TaskId } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { AppTooltip, VerticalDnD } from '@/shared/project-ui';
import { Button, cn } from '@/shared/ui-kit';
import { GroupTaskListSchemaFormData } from './group-task-list.form';

interface TaskListProps {
  readonly loadingTaskId?: TaskId;

  readonly onDelete?: (task: GroupTaskListSchemaFormData['tasks'][0]) => MaybePromise<void>;
  readonly onClone?: (task: GroupTaskListSchemaFormData['tasks'][0]) => MaybePromise<void>;
  readonly onAssign?: (task: GroupTaskListSchemaFormData['tasks'][0]) => MaybePromise<void>;
  readonly onFinish?: (task: GroupTaskListSchemaFormData['tasks'][0]) => MaybePromise<void>;

  readonly onHeaderClick: (task: GroupTaskListSchemaFormData['tasks'][0]) => MaybePromise<void>;
  readonly onContentClick: (task: GroupTaskListSchemaFormData['tasks'][0]) => MaybePromise<void>;
  readonly onUnassign: (task: GroupTaskListSchemaFormData['tasks'][0]) => MaybePromise<void>;
}

function TaskList({
  loadingTaskId,
  onContentClick,
  onHeaderClick,
  onUnassign,
  onDelete,
  onClone,
  onAssign,
  onFinish,
}: TaskListProps) {
  const { fields: tasks, move } = useFieldArray<
    { tasks: GroupTaskListSchemaFormData['tasks'] },
    FieldArrayPath<{ tasks: GroupTaskListSchemaFormData['tasks'] }>,
    'formUid'
  >({
    name: 'tasks',
    keyName: 'formUid',
  });

  const disabledDragging = loadingTaskId != null;

  return (
    <VerticalDnD
      items={tasks}
      disabledDragging={disabledDragging}
      className="gap-2"
      getId={(task) => task.formUid}
      onChange={({ oldIndex, newIndex }) => void move(oldIndex, newIndex)}
      renderItem={({ item: task, setNodeRef, style, isDragging, handleProps }) => {
        const disabledVariant = loadingTaskId === task.id;
        const disableDragging = isDragging || tasks.length <= 1 || disabledVariant || disabledDragging;

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
              startDate={task.startDate ?? undefined}
              afterHeaderSlot={({ variant }) => {
                const isDisabled = variant === 'disabled';

                return (
                  <div className="flex gap-1">
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

                    <TaskActionsDropdown
                      taskStatus={task.status}
                      hasGroup={task.groupId != null}
                      loading={disabledVariant}
                      taskType={TaskDomain.parseId(task.id).type}
                      onDelete={() => void onDelete?.(task)}
                      onFinish={() => void onFinish?.(task)}
                      onAssign={() => void onAssign?.(task)}
                      onClone={() => void onClone?.(task)}
                      onUnassign={() => void onUnassign?.(task)}
                    />
                  </div>
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
