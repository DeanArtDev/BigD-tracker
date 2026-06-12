'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { type PropsWithChildren, useId, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TaskFormData, TaskPriority } from '@/entity/planner/tasks';
import { taskFormSchema, TaskSubmitFormData } from './task-form-schema';
import { taskFormContext, TaskFromContext } from './task-from.context';

type TaskFormProviderProps = PropsWithChildren<{
  readonly loading?: boolean;
}>;

function TaskFormProvider({ loading, children }: TaskFormProviderProps) {
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

  const value = useMemo<TaskFromContext>(() => ({ formId }), [formId]);

  return (
    <FormProvider {...form}>
      <taskFormContext.Provider value={value}>{children}</taskFormContext.Provider>
    </FormProvider>
  );
}

export { TaskFormProvider, type TaskFormProviderProps };
