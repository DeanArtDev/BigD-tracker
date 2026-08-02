import { merge } from 'lodash-es';
import { ReactNode, useMemo } from 'react';
import { DeepPartial } from '@/shared/lib';
import { TaskStatus } from '@/shared/transport/graphql';
import { FieldState, taskFormFieldContext, TaskFromFieldContext } from './task-form-field.context';
import { TaskDomain } from '../../../../model';
import { TaskFieldStatus } from '../../../../model/domain';

interface TaskFormFieldProviderProps {
  readonly children: ReactNode;
  readonly taskStatus?: TaskStatus;
  readonly defaultFieldsState?: DeepPartial<TaskFromFieldContext['fieldsState']>;
  readonly blockState?: DeepPartial<TaskFromFieldContext['blockState']>;
}

function TaskFormFieldProvider({
  children,
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

    const fieldsState = merge(
      {},
      {
        name: createState({ disabled: isDisabled(domainAvailability.name) }),
        description: createState({ disabled: isDisabled(domainAvailability.description) }),
        recurrence: createState({ disabled: isDisabled(domainAvailability.recurrence) }),
        startDate: createState({ disabled: isDisabled(domainAvailability.startDate) }),
        deadline: createState({ disabled: isDisabled(domainAvailability.deadline) }),
        reason: createState({ disabled: isDisabled(domainAvailability.reason) }),
        priority: createState({ disabled: isDisabled(domainAvailability.priority) }),
      },
      defaultFieldsState,
    );

    const blockState = merge({}, { params: { disabled: false, collapsed: true } }, bs);

    return { fieldsState, blockState };
  }, [defaultFieldsState, taskStatus, bs]);

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
