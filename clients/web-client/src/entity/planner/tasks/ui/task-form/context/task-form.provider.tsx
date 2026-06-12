'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { type PropsWithChildren, useCallback, useId, useMemo } from 'react';
import { DefaultValues, FormProvider, useForm } from 'react-hook-form';
import { TaskFormData, TaskPriority } from '@/entity/planner/tasks';
import { taskFormSchema, TaskSubmitFormData } from './task-form-schema';
import { taskFormContext, TaskFromContext } from './task-from.context';

const defaultVisibility: TaskFromContext['fieldVisibility'] = {
  groupSelection: true,
};

const defaultValues: DefaultValues<TaskFormData> = {
  name: undefined,
  priority: TaskPriority.DELETE.toString(),
  description: undefined,
  deadline: undefined,
  startDate: undefined,
  groupId: undefined,
  isDescriptionDirty: false,
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
    defaultValues,
  });

  const { groupSelection = defaultVisibility?.groupSelection } = fieldVisibility;
  const resetToInit = useCallback(() => {
    void form.reset(undefined, {
      keepDirty: false,
      keepValues: false,
      keepErrors: false,
      keepDirtyValues: false,
    });
  }, [form]);

  const value = useMemo<TaskFromContext>(
    () => ({ formId, resetToInit, fieldVisibility: { groupSelection } }),
    [formId, groupSelection, resetToInit],
  );

  return (
    <FormProvider {...form}>
      <taskFormContext.Provider value={value}>{children}</taskFormContext.Provider>
    </FormProvider>
  );
}

export { TaskFormProvider, type TaskFormProviderProps, defaultValues };
