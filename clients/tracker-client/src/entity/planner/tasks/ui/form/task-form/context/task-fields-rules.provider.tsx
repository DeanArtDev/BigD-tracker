import { type PropsWithChildren, useMemo } from 'react';
import { getFieldRuleTypeByStatus } from '../constants';
import { type TaskFieldsRulesContext, taskFieldsRulesContext, type TaskFormRule } from './context';

interface TaskFieldsRulesProviderProps {
  readonly status: TaskFieldsRulesContext['status'];
}

function TaskFieldsRulesProvider({
  status,
  children,
}: PropsWithChildren<TaskFieldsRulesProviderProps>) {
  const value = useMemo<TaskFieldsRulesContext>(() => {
    if (status == null) {
      return { status };
    }

    const rulesType = getFieldRuleTypeByStatus(status);
    const isDisabled = rulesType === 'readonly';

    return {
      status,
      rules: {
        name: createRule({ type: 'editable' }),
        description: createRule({ type: 'editable' }),

        deadline: createRule({ type: rulesType, isDisabled }),
        startDate: createRule({ type: rulesType, isDisabled }),
        priority: createRule({ type: rulesType, isDisabled }),
        weight: createRule({ type: rulesType, isDisabled }),
      },
    };
  }, [status]);

  return (
    <taskFieldsRulesContext.Provider value={value}>{children}</taskFieldsRulesContext.Provider>
  );
}

function createRule(data: TaskFormRule): TaskFormRule {
  return {
    isDisabled: false,
    ...data,
  };
}

export { TaskFieldsRulesProvider, type TaskFieldsRulesProviderProps };
