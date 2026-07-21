'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { type PropsWithChildren, useCallback, useId, useMemo } from 'react';
import { DefaultValues, FormProvider, useForm } from 'react-hook-form';
import { Task, TaskFormData } from '@/entity/planner/tasks';
import { TaskPriority } from '@/entity/schema-types';
import timeAndDate from '@/shared/lib/time';
import { taskFormSchema, TaskSubmitFormData } from './task-form-schema';
import { taskFormContext, TaskFromContext } from './task-from.context';

const defaultValues: DefaultValues<TaskFormData> = {
  name: undefined,
  priority: TaskPriority.Delete,
  description: undefined,
  deadline: undefined,
  startDate: undefined,
  groupId: undefined,
  isDescriptionDirty: false,
};

type TaskFormProviderProps = PropsWithChildren<{
  readonly loading?: boolean;
  readonly task?: Task;
}>;

function TaskFormProvider({ task, loading, children }: TaskFormProviderProps) {
  const formId = useId();
  const isEdit = task != null;

  const values: TaskFormData | undefined = isEdit
    ? {
        name: task.name ?? undefined,
        priority: task.priority,
        description: task?.description ?? undefined,
        startDate: task.startDate != null ? timeAndDate(task.startDate).toDate() : undefined,
        deadline: task.deadline != null ? timeAndDate(task.deadline).toDate() : undefined,
        groupId: task.groupId ?? undefined,
        status: task?.status ?? undefined,
        isDescriptionDirty: false,
      }
    : undefined;

  const form = useForm<TaskFormData, unknown, TaskSubmitFormData>({
    resolver: standardSchemaResolver(taskFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    disabled: loading,
    values,
    defaultValues,
  });

  const resetToInit = useCallback(() => {
    void form.reset(undefined, {
      keepDirty: false,
      keepValues: false,
      keepErrors: false,
      keepDirtyValues: false,
    });
  }, [form]);

  const value = useMemo<TaskFromContext>(() => ({ formId, resetToInit }), [formId, resetToInit]);

  return (
    <FormProvider {...form}>
      <taskFormContext.Provider value={value}>{children}</taskFormContext.Provider>
    </FormProvider>
  );
}

export { TaskFormProvider, type TaskFormProviderProps, defaultValues };
