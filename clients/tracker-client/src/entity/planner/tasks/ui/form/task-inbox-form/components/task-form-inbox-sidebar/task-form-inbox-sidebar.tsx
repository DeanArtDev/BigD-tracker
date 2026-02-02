import { SidebarGroup, SidebarSeparator } from '@/shared/ui-kit/ui/sidebar';
import { TaskPriorityPickerForm } from '../../../task-priority-picker-form';
import { TaskSidebarRootForm } from '../../../task-sidebar-root-form';
import { TaskFormInboxDates } from './task-form-inbox-dates';

function TaskFormInboxSidebar() {
  return (
    <TaskSidebarRootForm>
      <SidebarGroup key="dates" className="flex gap-2">
        <TaskFormInboxDates />
      </SidebarGroup>

      <SidebarSeparator className="separator mx-0" />

      <SidebarGroup key="priority" className="px-4">
        <TaskPriorityPickerForm />
      </SidebarGroup>
    </TaskSidebarRootForm>
  );
}

export { TaskFormInboxSidebar };
