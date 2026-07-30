'use client';

import { useFormContext, useFormState } from 'react-hook-form';
import { createStrictContext, useStrictContext } from '@/shared/lib';
import { GroupBrand, TaskFormData, TaskSubmitFormData } from './task-form-schema';

interface TaskFromContext {
  readonly formId: string;
  readonly resetToInit: () => void;
}

const taskFormContext = createStrictContext<TaskFromContext>();

const useTaskFromContext = <TGroupId extends GroupBrand = GroupBrand>() => {
  return {
    ...useStrictContext<TaskFromContext>(taskFormContext),
    ...useFormContext<TaskFormData<TGroupId>, unknown, TaskSubmitFormData<TGroupId>>(),
  };
};

const useTaskFormState = <TGroupId extends GroupBrand = GroupBrand>() => useFormState<TaskFormData<TGroupId>>();

export { useTaskFromContext, useTaskFormState, taskFormContext, type TaskFromContext };
