import { TaskType } from '@/entity/planner/tasks';
import { type PropsWithChildren, useMemo } from 'react';
import { getFieldRuleTypeByStatus } from '../constants';
import { type TaskFieldsRulesContext, taskFieldsRulesContext, type TaskFormRule } from './context';

interface TaskFieldsRulesProviderProps {
  readonly options: {
    readonly visibility: TaskFieldsRulesContext['visibility'];
  };
  readonly status: TaskFieldsRulesContext['status'];
  readonly type?: TaskType;
}

function TaskFieldsRulesProvider({ status, type, options, children }: PropsWithChildren<TaskFieldsRulesProviderProps>) {
  const value = useMemo<TaskFieldsRulesContext>(() => {
    if (status == null) {
      return { status, visibility: options?.visibility };
    }

    const rulesType = getFieldRuleTypeByStatus(status);
    const isVirtual = type === TaskType.VIRTUAL;
    const isOverride = type === TaskType.OVERRIDE;
    const isDisabled = rulesType === 'readonly';

    return {
      status,
      visibility: options?.visibility,
      rules: {
        name: createRule({ type: 'editable' }),
        description: createRule({ type: 'editable' }),

        deadline: createRule({ type: rulesType, isDisabled }),
        startDate: createRule({ type: rulesType, isDisabled }),
        priority: createRule({ type: rulesType, isDisabled }),
        weight: createRule({ type: rulesType, isDisabled }),
        recurrence: createRule({
          type: isVirtual || isOverride ? 'hidden' : rulesType,
          isDisabled: isVirtual || isOverride ? true : isDisabled,
        }),
      },
    };
  }, [status, type, options?.visibility]);

  return <taskFieldsRulesContext.Provider value={value}>{children}</taskFieldsRulesContext.Provider>;
}

function createRule(data: TaskFormRule): TaskFormRule {
  return {
    isDisabled: false,
    ...data,
  };
}

export { TaskFieldsRulesProvider, type TaskFieldsRulesProviderProps };
