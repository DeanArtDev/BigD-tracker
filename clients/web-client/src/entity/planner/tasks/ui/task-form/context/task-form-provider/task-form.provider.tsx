'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { type PropsWithChildren, useCallback, useId, useMemo } from 'react';
import { DefaultValues, FormProvider, useForm } from 'react-hook-form';
import { Brand } from '@/shared/lib';
import timeAndDate from '@/shared/lib/time';
import { TaskPriority } from '@/shared/transport/graphql';
import { TaskFormData, taskFormSchema, TaskSubmitFormData } from './task-form-schema';
import { taskFormContext, TaskFromContext } from './task-from.context';
import { Task } from '../../../../model';

type TaskFormProviderProps<BrandGroup extends Brand<number, string>> = PropsWithChildren<{
  readonly loading?: boolean;
  readonly task?: Task<BrandGroup>;
  readonly defaultValues?: Omit<DefaultValues<TaskFormData<BrandGroup>>, 'isDescriptionDirty'>;
}>;

function TaskFormProvider<BrandGroup extends Brand<number, string>>({
  task,
  loading,
  defaultValues,
  children,
}: TaskFormProviderProps<BrandGroup>) {
  const formId = useId();
  const isEdit = task != null;

  const dF: DefaultValues<TaskFormData<BrandGroup>> = {
    name: undefined,
    priority: TaskPriority.Delete,
    description: undefined,
    deadline: undefined,
    startDate: undefined,
    groupId: undefined,
    isDescriptionDirty: false,
    ...defaultValues,
  };

  const values: TaskFormData<BrandGroup> | undefined = isEdit
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

  const form = useForm<TaskFormData<BrandGroup>, unknown, TaskSubmitFormData<BrandGroup>>({
    resolver: standardSchemaResolver<TaskFormData<BrandGroup>, unknown, TaskSubmitFormData<BrandGroup>>(
      taskFormSchema<BrandGroup>(),
    ),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    disabled: loading,
    values,
    defaultValues: dF,
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

export { TaskFormProvider, type TaskFormProviderProps };
