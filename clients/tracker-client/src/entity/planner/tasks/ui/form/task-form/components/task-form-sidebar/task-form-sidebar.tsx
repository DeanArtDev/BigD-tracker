import { SidebarGroup, SidebarSeparator } from '@/shared/ui-kit/ui/sidebar';
import { TaskPriorityPickerForm } from '../../../task-priority-picker-form';
import { TaskSidebarRootForm } from '../../../task-sidebar-root-form';
import { TaskFormDates } from './task-form-dates';

function TaskFormSidebar() {
  return (
    <TaskSidebarRootForm>
      <SidebarGroup key="dates" className="flex gap-2">
        <TaskFormDates />
      </SidebarGroup>

      <SidebarSeparator className="separator mx-0" />

      <SidebarGroup key="priority" className="px-4">
        <TaskPriorityPickerForm />
      </SidebarGroup>
    </TaskSidebarRootForm>
  );
}

export { TaskFormSidebar };
