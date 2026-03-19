import { TaskStatus } from '@/entity/planner/tasks';
import { createStrictContext, useStrictContext } from '@/shared/lib/react/strict-context';

interface TaskFormRule {
  readonly type: 'editable' | 'readonly' | 'hidden';
  readonly hint?: string;
  readonly isDisabled?: boolean;
}

interface TaskFormFiledRuleMap {
  readonly name: TaskFormRule;
  readonly description: TaskFormRule;
  readonly deadline: TaskFormRule;
  readonly startDate: TaskFormRule;
  readonly priority: TaskFormRule;
  readonly weight: TaskFormRule;
  readonly recurrence: TaskFormRule;
}

interface TaskFieldsRulesContext {
  readonly status?: TaskStatus;
  readonly rules?: TaskFormFiledRuleMap;
  readonly visibility: {
    readonly recurrence: boolean;
    readonly weight: boolean;
  };
}

const taskFieldsRulesContext = createStrictContext<TaskFieldsRulesContext>();

const useTaskFieldsRulesContext = () => useStrictContext<TaskFieldsRulesContext>(taskFieldsRulesContext);

export {
  useTaskFieldsRulesContext,
  taskFieldsRulesContext,
  type TaskFieldsRulesContext,
  type TaskFormRule,
  type TaskFormFiledRuleMap,
};
