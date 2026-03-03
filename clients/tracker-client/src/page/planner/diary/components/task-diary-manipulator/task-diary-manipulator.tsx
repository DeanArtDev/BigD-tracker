import { TaskCreation } from '@/feature/planner/tasks/task-creation';
import { TaskDiaryDrawer } from '../task-diary-drawer';
import { AppManipulatorContainer } from '@/shared/components/app-manipulator-container';
import { ButtonAdd } from '@/shared/components/button-add';
import { Button } from '@/shared/ui-kit/ui/button';
import { ListOrdered } from 'lucide-react';

function TaskDiaryManipulator() {
  return (
    <AppManipulatorContainer
      items={[
        {
          key: 'groups',
          className: 'lg:hidden',
          element: (
            <TaskDiaryDrawer
              trigger={
                <Button variant="outline" size="icon-lg">
                  <ListOrdered className="size-6" />
                </Button>
              }
            />
          ),
        },
        {
          key: 'add-task',
          element: (
            <TaskCreation
              options={{ visibility: { recurrence: false } }}
              trigger={
                <ButtonAdd variant="outline" size="icon-lg" iconProps={{ className: 'size-7' }} />
              }
            />
          ),
        },
      ]}
    />
  );
}

export { TaskDiaryManipulator };
