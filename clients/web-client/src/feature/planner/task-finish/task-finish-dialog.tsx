import { useEffect, useState } from 'react';
import { TaskId } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { AppDialog } from '@/shared/project-ui';
import { TaskFinishStatus } from '@/shared/transport/graphql';
import {
  Button,
  ButtonLoading,
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from '@/shared/ui-kit';

interface TaskFinishDialogProps {
  readonly open?: boolean;
  readonly taskId?: TaskId;
  readonly loading?: boolean;
  readonly onOpenChange?: (value: boolean) => void;
  readonly onFinish?: (data: { status: TaskFinishStatus; reason?: string }) => MaybePromise<void>;
}

function TaskFinishDialog({ open, loading = false, onOpenChange, onFinish }: TaskFinishDialogProps) {
  const [status, setStatus] = useState<TaskFinishStatus>(TaskFinishStatus.Completed);
  const [reason, setReason] = useState<string>();

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(TaskFinishStatus.Completed);
      setReason(undefined);
    }
  }, [open]);

  return (
    <AppDialog
      open={open}
      className="sm:max-w-130"
      onOpenChange={(value) => {
        if (loading) return;
        onOpenChange?.(value);
      }}
      title="Завершение дела"
      description="Как ты хочешь завершить эту задачу?"
      content={
        <div className="grow flex flex-col gap-5 p-5">
          <RadioGroup
            disabled={loading}
            value={status}
            onValueChange={(value: TaskFinishStatus) => {
              setStatus(value);
            }}
          >
            <FieldLabel htmlFor={TaskFinishStatus.Completed}>
              <Field orientation="horizontal">
                <RadioGroupItem value={TaskFinishStatus.Completed} id={TaskFinishStatus.Completed} />

                <FieldContent>
                  <FieldTitle>Выполнена</FieldTitle>
                  <FieldDescription>Задача успешно сделана</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>

            <FieldLabel htmlFor={TaskFinishStatus.Canceled}>
              <Field orientation="horizontal">
                <RadioGroupItem value={TaskFinishStatus.Canceled} id={TaskFinishStatus.Canceled} />

                <FieldContent>
                  <FieldTitle>Отменена</FieldTitle>
                  <FieldDescription>Решил не делать эту задачу</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>

            <FieldLabel htmlFor={TaskFinishStatus.Overdue}>
              <Field orientation="horizontal">
                <RadioGroupItem value={TaskFinishStatus.Overdue} id={TaskFinishStatus.Overdue} />

                <FieldContent>
                  <FieldTitle>Просрочена</FieldTitle>
                  <FieldDescription>Не успел сделать в срок</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
          </RadioGroup>

          <Field>
            <FieldLabel>Заметка (необязательно)</FieldLabel>

            <Textarea
              disabled={loading}
              className="resize-none min-h-24"
              value={reason}
              placeholder="Можешь оставить заметку, чтобы потом помнить почему"
              onChange={(evt) => {
                setReason(evt.target.value);
              }}
            />
          </Field>

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => {
                if (loading) return;
                onOpenChange?.(false);
              }}
            >
              Отмена
            </Button>
            <ButtonLoading loading={loading} onClick={async () => await onFinish?.({ reason, status })}>
              Завершить
            </ButtonLoading>
          </div>
        </div>
      }
    />
  );
}

export { TaskFinishDialog };
