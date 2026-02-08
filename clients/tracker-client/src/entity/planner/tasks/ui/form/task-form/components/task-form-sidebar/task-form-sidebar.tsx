import { InputNumberForm } from '@/shared/components/form';
import { Label } from '@/shared/ui-kit/ui/label';
import { SidebarGroup, SidebarSeparator } from '@/shared/ui-kit/ui/sidebar';
import type { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';
import { z } from 'zod';
import { TaskPriorityPickerForm } from '../../../task-priority-picker-form';
import { TaskSidebarRootForm } from '../../../task-sidebar-root-form';
import { useTaskFieldsRulesContext } from '../../context';
import { validationStrategyByStatus } from '../../validation-strategy';
import { TaskFormDates } from './task-form-dates';

interface TaskFormSidebarProps {
  readonly footerSidebarSlot?: ReactNode;
}

function TaskFormSidebar(props: TaskFormSidebarProps) {
  const { status, rules } = useTaskFieldsRulesContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validationSchema = validationStrategyByStatus(status);
  type TaskFormData = z.input<typeof validationSchema>;

  const weight = useWatch<{ weight: TaskFormData['weight'] }>({ name: 'weight' });

  return (
    <TaskSidebarRootForm>
      <SidebarGroup key="dates" className="flex gap-2">
        <TaskFormDates disabled={rules?.startDate.isDisabled || rules?.deadline.isDisabled} />
      </SidebarGroup>

      <SidebarSeparator className="separator mx-0" />

      <SidebarGroup key="priority" className="flex flex-row px-4 gap-4">
        <TaskPriorityPickerForm disabled={rules?.priority.isDisabled} />

        {rules?.weight.isDisabled ? (
          <div className="flex flex-col">
            <Label>Вес</Label>
            <span className="flex grow items-center text-gray-400">{weight}</span>
          </div>
        ) : (
          <InputNumberForm
            tabIndex={-1}
            isErrorMessage
            name="weight"
            label="Вес"
            step="any"
            placeholder="0-100"
            classNames={{ wrapper: 'w-20', input: 'bg-background' }}
          />
        )}
      </SidebarGroup>

      <SidebarSeparator className="separator mx-0" />

      <SidebarGroup className="mt-auto">{props.footerSidebarSlot}</SidebarGroup>
    </TaskSidebarRootForm>
  );
}

export { TaskFormSidebar };
