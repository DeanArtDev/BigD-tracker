import { TaskStatus } from '../../../../model';
import { getFieldRuleTypeByStatus } from '../constants';
import { maxLevelValidation } from './max-level-validation';

const validationStrategyByStatus = (status?: TaskStatus) => {
  if (status == null) {
    return maxLevelValidation;
  }
  const ruleType = getFieldRuleTypeByStatus(status);

  switch (ruleType) {
    case 'editable':
      return maxLevelValidation;

    case 'readonly':
      return maxLevelValidation;

    default:
      throw new Error(`Unknown strategy by status: ${status}`);
  }
};

export { validationStrategyByStatus };
