'use client';

import { createStrictContext, useStrictContext } from '@/shared/lib';

interface FieldState {
  readonly hidden: boolean;
  readonly disabled: boolean;
}

interface TaskFromFieldContext {
  readonly blockState: {
    readonly params: { collapsed: boolean; disabled: boolean };
  };
  readonly fieldsState: {
    readonly name: FieldState;
    readonly description: FieldState;
    readonly recurrence: FieldState;
    readonly startDate: FieldState & { readonly clearable?: boolean };
    readonly deadline: FieldState & { readonly clearable?: boolean };
    readonly reason: FieldState;
    readonly priority: FieldState;
  };
}

const taskFormFieldContext = createStrictContext<TaskFromFieldContext>();

const useTaskFormFieldContext = () => {
  return useStrictContext<TaskFromFieldContext>(taskFormFieldContext);
};

export { useTaskFormFieldContext, taskFormFieldContext, type TaskFromFieldContext, type FieldState };
