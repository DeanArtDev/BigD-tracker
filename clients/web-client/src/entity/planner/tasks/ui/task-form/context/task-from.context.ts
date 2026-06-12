'use client';

import { useFormContext, useFormState } from 'react-hook-form';
import { createStrictContext, useStrictContext } from '@/shared/lib';
import { TaskFormData, TaskSubmitFormData } from './task-form-schema';

interface TaskFromContext {
  readonly formId: string;
  readonly resetToInit: () => void;
  readonly fieldVisibility?: {
    readonly groupSelection?: boolean;
  };
}

const taskFormContext = createStrictContext<TaskFromContext>();

const useTaskFromContext = () => {
  return {
    ...useStrictContext<TaskFromContext>(taskFormContext),
    ...useFormContext<TaskFormData, unknown, TaskSubmitFormData>(),
  };
};

const useTaskFormState = () => useFormState<TaskFormData>();

export { useTaskFromContext, useTaskFormState, taskFormContext, type TaskFromContext };
