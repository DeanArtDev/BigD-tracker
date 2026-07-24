import { Link2Off } from 'lucide-react';
import { type FieldArrayPath, useFieldArray } from 'react-hook-form';
import { TaskCard, TaskId } from '@/entity/planner/tasks';
import { AppTooltip, VerticalDnD } from '@/shared/project-ui';
import { Button } from '@/shared/ui-kit';
import { GroupTaskListSchemaFormData } from './group-task-list.form';

interface TaskListProps {
  readonly onHeaderClick: (task: GroupTaskListSchemaFormData['tasks'][0]) => void;
  readonly onContentClick: (task: GroupTaskListSchemaFormData['tasks'][0]) => void;
}

function TaskList({ onContentClick, onHeaderClick }: TaskListProps) {
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
        const disableDragging = isDragging || tasks.length <= 1;

        return (
          <div style={style} {...(disableDragging ? {} : handleProps)} ref={setNodeRef}>
            <TaskCard
              id={task.id as TaskId}
              className="group/task-card-wrapper"
              priority={task.priority}
              status={task.status}
              name={task.name}
              afterHeaderSlot={
                <AppTooltip content="Отвязать дело от группы" delayDuration={1500}>
                  <Button
                    className="opacity-0 transition-opacity group-hover/task-card-wrapper:opacity-100 focus-visible:opacity-100"
                    size="icon-sm"
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
                  >
                    <Link2Off className="stroke-muted-foreground" />
                  </Button>
                </AppTooltip>
              }
              onContentClick={() => void onContentClick(task)}
              onHeaderClick={() => void onHeaderClick(task)}
            />
          </div>
        );
      }}
    />
  );
}

export { TaskList };
