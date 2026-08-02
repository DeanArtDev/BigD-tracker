import { TaskRecurrenceForm } from '../recurrence';
import { SidebarGroup, SidebarSeparator } from '@/shared/ui-kit/ui/sidebar';
import type { ReactNode } from 'react';
import { TaskPriorityPickerForm } from '../../../task-priority-picker-form';
import { TaskSidebarRootForm } from '../../../task-sidebar-root-form';
import { useTaskFieldsRulesContext } from '../../context';
import { TaskFormDates } from './task-form-dates';

interface TaskFormSidebarProps {
  readonly footerSidebarSlot?: ReactNode;
}

function TaskFormSidebar(props: TaskFormSidebarProps) {
  const { rules, visibility } = useTaskFieldsRulesContext();
  const { recurrence } = visibility;
  return (
    <TaskSidebarRootForm>
      <SidebarGroup key="dates" className="flex gap-2">
        <TaskFormDates disabled={rules?.startDate.isDisabled || rules?.deadline.isDisabled} />
      </SidebarGroup>

      <SidebarSeparator className="separator mx-0" />

      <SidebarGroup key="priority" className="flex flex-row px-4 gap-4">
        <TaskPriorityPickerForm disabled={rules?.priority.isDisabled} />
      </SidebarGroup>

      {rules?.recurrence.type !== 'hidden' && recurrence && (
        <>
          <SidebarSeparator className="separator mx-0" />
          <SidebarGroup key="recurrence" className="flex flex-row px-4 gap-4">
            <TaskRecurrenceForm />
          </SidebarGroup>
        </>
      )}

      <SidebarSeparator className="separator mx-0" />

      {props.footerSidebarSlot}
    </TaskSidebarRootForm>
  );
}

export { TaskFormSidebar };
