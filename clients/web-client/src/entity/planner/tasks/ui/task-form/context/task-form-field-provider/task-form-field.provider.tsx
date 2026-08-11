import { merge } from 'lodash-es';
import { ReactNode, useMemo } from 'react';
import { DeepPartial } from '@/shared/lib';
import { TaskStatus } from '@/shared/transport/graphql';
import { FieldState, taskFormFieldContext, TaskFromFieldContext } from './task-form-field.context';
import { TaskDomain, TaskType } from '../../../../model';
import { TaskFieldStatus } from '../../../../model/domain';

interface TaskFormFieldProviderProps {
  readonly children: ReactNode;
  readonly taskStatus?: TaskStatus;
  readonly taskType?: TaskType;
  readonly defaultFieldsState?: DeepPartial<TaskFromFieldContext['fieldsState']>;
  readonly blockState?: DeepPartial<TaskFromFieldContext['blockState']>;
}

function TaskFormFieldProvider({
  children,
  taskType,
  taskStatus,
  defaultFieldsState,
  blockState: bs,
}: TaskFormFieldProviderProps) {
  const value = useMemo<TaskFromFieldContext>(() => {
    const domainAvailability: ReturnType<typeof TaskDomain.fieldsToChangeByStatus> =
      taskStatus != null
        ? TaskDomain.fieldsToChangeByStatus(taskStatus)
        : {
            name: 'editable',
            description: 'editable',
            recurrence: 'editable',
            startDate: 'editable',
            deadline: 'editable',
            reason: 'editable',
            priority: 'editable',
          };
    const isDisabled = (value: TaskFieldStatus) => value === 'readonly';

    const isVirtual = taskType === TaskType.Virtual;
    const isOverride = taskType === TaskType.Override;

    const fieldsState = merge(
      {},
      {
        name: createState({ disabled: isDisabled(domainAvailability.name) }),
        description: createState({ disabled: isDisabled(domainAvailability.description) }),
        recurrence: createState({
          hidden: isVirtual || isOverride,
          disabled: isVirtual || isOverride ? true : isDisabled(domainAvailability.recurrence),
        }),
        startDate: createState({ disabled: isDisabled(domainAvailability.startDate) }),
        deadline: createState({ disabled: isDisabled(domainAvailability.deadline) }),
        reason: createState({ disabled: isDisabled(domainAvailability.reason) }),
        priority: createState({ disabled: isDisabled(domainAvailability.priority) }),
      },
      defaultFieldsState,
    );

    const blockState = merge({}, { params: { disabled: false, collapsed: true } }, bs);

    return { fieldsState, blockState };
  }, [taskStatus, taskType, defaultFieldsState, bs]);

  return <taskFormFieldContext.Provider value={value}>{children}</taskFormFieldContext.Provider>;
}

function createState(state: Partial<FieldState> = {}): FieldState {
  return {
    disabled: false,
    hidden: false,
    ...state,
  };
}

export { TaskFormFieldProvider, type TaskFormFieldProviderProps };
