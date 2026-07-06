import { useTaskFromContext } from '@/entity/planner/tasks';
import { ButtonLoading } from '@/shared/ui-kit';

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
