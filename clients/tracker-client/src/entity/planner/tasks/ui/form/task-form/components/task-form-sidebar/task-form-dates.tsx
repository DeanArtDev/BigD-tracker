import { TaskDeadlineDate, TaskStartDate } from '@/entity/planner/tasks/ui';
import { DatePickerForm, TimeForm } from '@/shared/components/form';
import { Typography } from '@/shared/components/typography';
import dayjs from '@/shared/lib/time';
import { Button } from '@/shared/ui-kit/ui/button';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { cn } from '@/shared/ui-kit/utils';
import { Plus } from 'lucide-react';
import { Fragment } from 'react';
import { useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useValidationSchema } from '../../lib/use-validation-schema';

function TaskFormDates(props: { disabled?: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validationSchema = useValidationSchema();
  type TaskFormData = z.input<typeof validationSchema>;

  const startDate = useWatch<{ startDate: TaskFormData['startDate'] }>({ name: 'startDate' });
  const deadline = useWatch<{ deadline: TaskFormData['deadline'] }>({ name: 'deadline' });

  const dateLimits = getMinMaxValues({ startDate, deadline });

  return (
    <Fragment>
      <div className="flex flex-col gap-2 items-start px-2">
        <Typography.H4 className="text-md font-normal">Начало:</Typography.H4>

        <div className="flex gap-2 items-center">
          <DatePickerForm<TaskFormData>
            name="startDate"
            isErrorMessage={false}
            min={dateLimits.startDate.min}
            max={dateLimits.startDate.max}
            renderInput={({ ref, value, disabled, onBlur }) => {
              return (
                <Button
                  ref={ref}
                  type="button"
                  className={cn({ 'size-5': value == null })}
                  disabled={disabled || props.disabled}
                  variant="ghost"
                  tabIndex={-1}
                  onBlur={onBlur}
                >
                  {value != null ? <TaskStartDate startDate={value} size={15} showDate /> : <Plus />}
                </Button>
              );
            }}
          />

          {startDate != null && (
            <>
              <span className="flex gap-2">&mdash;</span>

              <TimeForm<TaskFormData>
                classNames={{ wrapper: 'max-w-18' }}
                name="startDate"
                format="HH:mm"
                step="60"
                disabled={props.disabled}
                isErrorMessage={false}
                tabIndex={-1}
              />
            </>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2 items-start px-2">
        <Typography.H4 className="text-md font-normal">Дедлайн:</Typography.H4>

        <div className="flex gap-2 items-center">
          <DatePickerForm<TaskFormData>
            name="deadline"
            endDay
            isErrorMessage={false}
            min={dateLimits.deadline.min}
            max={dateLimits.deadline.max}
            renderInput={({ ref, value, disabled, onBlur }) => {
              return (
                <Button
                  ref={ref}
                  className={cn({ 'size-5': value == null })}
                  disabled={disabled || props.disabled}
                  type="button"
                  variant="ghost"
                  onBlur={onBlur}
                  tabIndex={-1}
                >
                  {value != null ? <TaskDeadlineDate deadline={value} size={15} showDate /> : <Plus />}
                </Button>
              );
            }}
          />

          {deadline != null && (
            <>
              <span className="flex gap-2">&mdash;</span>

              <TimeForm<TaskFormData>
                classNames={{ wrapper: 'max-w-18' }}
                name="deadline"
                format="HH:mm"
                disabled={props.disabled}
                step="60"
                isErrorMessage={false}
                tabIndex={-1}
              />
            </>
          )}
        </div>
      </div>
    </Fragment>
  );
}

function getMinMaxValues(dates: { startDate: Date | null | undefined; deadline: Date | null | undefined }): {
  startDate: { min: Date | undefined; max: Date | undefined };
  deadline: { min: Date | undefined; max: Date | undefined };
} {
  const { deadline, startDate } = dates;

  const deadlineMin = deadline != null ? dayjs(deadline).startOf('day').toDate() : null;

  return {
    startDate: {
      min: undefined,
      max: deadline != null ? dayjs(deadline).endOf('day').toDate() : undefined,
    },

    deadline: {
      min:
        (deadlineMin ?? startDate != null) ? dayjs(startDate).startOf('day').toDate() : dayjs().startOf('day').toDate(),
      max: undefined,
    },
  };
}

export { TaskFormDates };
