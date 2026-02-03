import { InputNumberForm } from '@/shared/components/form';
import { SidebarGroup, SidebarSeparator } from '@/shared/ui-kit/ui/sidebar';
import type { ReactNode } from 'react';
import { TaskPriorityPickerForm } from '../../../task-priority-picker-form';
import { TaskSidebarRootForm } from '../../../task-sidebar-root-form';
import { TaskFormDates } from './task-form-dates';

interface TaskFormSidebarProps {
  readonly footerSidebarSlot?: ReactNode;
}

function TaskFormSidebar(props: TaskFormSidebarProps) {
  return (
    <TaskSidebarRootForm>
      <SidebarGroup key="dates" className="flex gap-2">
        <TaskFormDates />
      </SidebarGroup>

      <SidebarSeparator className="separator mx-0" />

      <SidebarGroup key="priority" className="flex flex-row px-4">
        <TaskPriorityPickerForm />

        <InputNumberForm
          tabIndex={-1}
          isErrorMessage
          name="weight"
          label="Вес"
          step="any"
          placeholder="0-100"
          classNames={{ wrapper: 'px-3 w-20', input: 'bg-background' }}
        />
      </SidebarGroup>

      <SidebarSeparator className="separator mx-0" />

      <SidebarGroup className="mt-auto">{props.footerSidebarSlot}</SidebarGroup>
    </TaskSidebarRootForm>
  );
}

export { TaskFormSidebar };
