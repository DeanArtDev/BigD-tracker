import { ButtonLoading } from '@/shared/ui-kit';
import { useTaskFromContext } from '../context/task-form-provider';

function TaskFormFooter() {
  const { formId, formState } = useTaskFromContext();

  return (
    <ButtonLoading
      form={formId}
      loading={formState.isLoading}
      disabled={formState.disabled || !formState.isDirty}
      type="submit"
    >
      Сохранить
    </ButtonLoading>
  );
}

export { TaskFormFooter };
