import { TaskStatus } from '@/entity/planner/tasks';
import { getFieldRuleTypeByStatus } from '../constants';
import { maxLevelValidation } from './max-level-validation';
import { nameDescValidation } from './name-desc-validation';

const validationStrategyByStatus = (status?: TaskStatus) => {
  if (status == null) {
    return maxLevelValidation;
  }

  const ruleType = getFieldRuleTypeByStatus(status);

  switch (ruleType) {
    case 'editable':
      return maxLevelValidation;

    case 'readonly':
      return nameDescValidation;

    default:
      throw new Error(`Unknown strategy by status: ${status}`);
  }
};

export { validationStrategyByStatus };
