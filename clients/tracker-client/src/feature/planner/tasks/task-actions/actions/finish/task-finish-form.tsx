import { TaskFinishStatus } from '@/entity/planner/tasks';
import { taskStatusToIconMap } from '@/entity/planner/tasks/lib/maps';
import { ButtonLoading } from '@/shared/components/button-loading';
import { FormStateEmitter, type FormStateEmitterProps, RadioGroupForm, TextareaForm } from '@/shared/components/form';
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from '@/shared/ui-kit/ui/field';
import { Form } from '@/shared/ui-kit/ui/form';
import { RadioGroupItem } from '@/shared/ui-kit/ui/radio-group';
import { useForm } from 'react-hook-form';

interface TaskFinishFormData {
  readonly type: TaskFinishStatus;
  readonly reason?: string;
}

interface TaskFinishFormProps extends FormStateEmitterProps {
  readonly onSubmit: (data: TaskFinishFormData) => void;
}

function TaskFinishForm(props: TaskFinishFormProps) {
  const { isLoading = false, emitIsDirty, emitIsLoading, onSubmit } = props;

  const form = useForm<TaskFinishFormData>({
    disabled: isLoading,
    values: {
      type: TaskFinishStatus.COMPLETED,
    },
    defaultValues: {
      type: TaskFinishStatus.COMPLETED,
    },
  });

  const showReason = [TaskFinishStatus.CANCELED, TaskFinishStatus.OVERDUE].includes(form.watch('type'));

  const CompletedIcon = taskStatusToIconMap[TaskFinishStatus.COMPLETED];
  const OverdueIcon = taskStatusToIconMap[TaskFinishStatus.OVERDUE];
  const CanceledIcon = taskStatusToIconMap[TaskFinishStatus.CANCELED];

  return (
    <Form {...form}>
      <form
        noValidate
        className="flex grow min-h-0 h-full flex-col"
        onSubmit={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          form.handleSubmit((formData) => {
            if (formData.type === TaskFinishStatus.COMPLETED) {
              return void onSubmit({ type: formData.type });
            }

            onSubmit(formData);
          })(evt);
        }}
      >
        <RadioGroupForm name="type">
          <FieldLabel htmlFor={TaskFinishStatus.COMPLETED}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>
                  <CompletedIcon />
                  Выполнено
                </FieldTitle>
                <FieldDescription>Дело выполнено как и задумывалось</FieldDescription>
              </FieldContent>
              <RadioGroupItem value={TaskFinishStatus.COMPLETED} id={TaskFinishStatus.COMPLETED} />
            </Field>
          </FieldLabel>

          <FieldLabel htmlFor={TaskFinishStatus.OVERDUE}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>
                  <OverdueIcon />
                  Просрочено
                </FieldTitle>
                <FieldDescription>Запланированный дедлайн просрочен</FieldDescription>
              </FieldContent>
              <RadioGroupItem value={TaskFinishStatus.OVERDUE} id={TaskFinishStatus.OVERDUE} />
            </Field>
          </FieldLabel>

          <FieldLabel htmlFor={TaskFinishStatus.CANCELED}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>
                  <CanceledIcon />
                  Отменено
                </FieldTitle>
                <FieldDescription>Дело отменено по причине</FieldDescription>
              </FieldContent>
              <RadioGroupItem value={TaskFinishStatus.CANCELED} id={TaskFinishStatus.CANCELED} />
            </Field>
          </FieldLabel>
        </RadioGroupForm>

        {showReason && (
          <TextareaForm
            name="reason"
            label="Причина"
            placeholder="Опишите причну"
            classNames={{ wrapper: 'mt-5', textarea: 'h-[90px] max-h-[350px] resize-none' }}
          />
        )}

        <ButtonLoading
          type="submit"
          className="mt-auto ml-auto"
          isLoading={isLoading}
          disabled={form.formState.disabled}
        >
          Завершить
        </ButtonLoading>

        <FormStateEmitter isLoading={isLoading} emitIsDirty={emitIsDirty} emitIsLoading={emitIsLoading} />
      </form>
    </Form>
  );
}

export { TaskFinishForm };
