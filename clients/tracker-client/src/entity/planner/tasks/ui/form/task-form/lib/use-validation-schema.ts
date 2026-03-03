import { useTaskFieldsRulesContext } from '../context';
import { validationStrategyByStatus } from '../validation-strategy';

function useValidationSchema() {
  const { status } = useTaskFieldsRulesContext();
  return validationStrategyByStatus(status);
}

export { useValidationSchema };
