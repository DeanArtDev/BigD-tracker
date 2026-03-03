import { type PropsWithChildren, useMemo } from 'react';
import { getFieldRuleTypeByStatus } from '../constants';
import { type TaskFieldsRulesContext, taskFieldsRulesContext, type TaskFormRule } from './context';

interface TaskFieldsRulesProviderProps {
  readonly options?: {
    readonly visibility?: TaskFieldsRulesContext['visibility'];
  };
  readonly status: TaskFieldsRulesContext['status'];
}

function TaskFieldsRulesProvider({ status, options, children }: PropsWithChildren<TaskFieldsRulesProviderProps>) {
  const value = useMemo<TaskFieldsRulesContext>(() => {
    if (status == null) {
      return { status, visibility: options?.visibility };
    }

    const rulesType = getFieldRuleTypeByStatus(status);
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
        recurrence: createRule({ type: rulesType, isDisabled }),
      },
    };
  }, [status, options?.visibility]);

  return <taskFieldsRulesContext.Provider value={value}>{children}</taskFieldsRulesContext.Provider>;
}

function createRule(data: TaskFormRule): TaskFormRule {
  return {
    isDisabled: false,
    ...data,
  };
}

export { TaskFieldsRulesProvider, type TaskFieldsRulesProviderProps };
