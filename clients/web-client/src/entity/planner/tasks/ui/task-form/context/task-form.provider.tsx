'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { type PropsWithChildren, useId, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TaskFormData, TaskPriority } from '@/entity/planner/tasks';
import { taskFormSchema, TaskSubmitFormData } from './task-form-schema';
import { taskFormContext, TaskFromContext } from './task-from.context';

const defaultVisibility: TaskFromContext['fieldVisibility'] = {
  groupSelection: true,
};

type TaskFormProviderProps = PropsWithChildren<{
  readonly loading?: boolean;
  readonly fieldVisibility?: TaskFromContext['fieldVisibility'];
}>;

function TaskFormProvider({ loading, fieldVisibility = {}, children }: TaskFormProviderProps) {
  const formId = useId();

  const form = useForm<TaskFormData, unknown, TaskSubmitFormData>({
    resolver: standardSchemaResolver(taskFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    disabled: loading,
    defaultValues: {
      name: undefined,
      priority: TaskPriority.DELETE.toString(),
      description: undefined,
      deadline: undefined,
      startDate: undefined,
      groupId: undefined,
    },
  });

  const { groupSelection = defaultVisibility?.groupSelection } = fieldVisibility;

  const value = useMemo<TaskFromContext>(
    () => ({ formId, fieldVisibility: { groupSelection } }),
    [formId, groupSelection],
  );

  return (
    <FormProvider {...form}>
      <taskFormContext.Provider value={value}>{children}</taskFormContext.Provider>
    </FormProvider>
  );
}

export { TaskFormProvider, type TaskFormProviderProps };
