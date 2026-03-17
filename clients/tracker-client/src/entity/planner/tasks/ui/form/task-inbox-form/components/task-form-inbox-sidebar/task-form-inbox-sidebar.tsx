import { SidebarGroup, SidebarSeparator } from '@/shared/ui-kit/ui/sidebar';
import { isFunction } from 'lodash-es';
import type { ReactNode } from 'react';
import { useFormState } from 'react-hook-form';
import { TaskPriorityPickerForm } from '../../../task-priority-picker-form';
import { TaskSidebarRootForm } from '../../../task-sidebar-root-form';
import { TaskFormInboxDates } from './task-form-inbox-dates';
interface TaskFormInboxSidebarProps {
  readonly footerSlot?: ReactNode | ((props: { disabled: boolean }) => ReactNode);
}

function TaskFormInboxSidebar({ footerSlot }: TaskFormInboxSidebarProps) {
  const { disabled } = useFormState();

  return (
    <TaskSidebarRootForm>
      <SidebarGroup key="dates" className="flex gap-2">
        <TaskFormInboxDates />
      </SidebarGroup>

      <SidebarSeparator className="separator mx-0" />

      <SidebarGroup key="priority" className="px-4">
        <TaskPriorityPickerForm />
      </SidebarGroup>

      <SidebarGroup>{isFunction(footerSlot) ? footerSlot({ disabled }) : footerSlot}</SidebarGroup>
    </TaskSidebarRootForm>
  );
}

export { TaskFormInboxSidebar };
