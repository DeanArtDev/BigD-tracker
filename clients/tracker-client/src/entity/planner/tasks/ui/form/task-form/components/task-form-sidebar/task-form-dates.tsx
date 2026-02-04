import { TaskDeadlineDate, TaskStartDate } from '@/entity/planner/tasks/ui';
import { DatePickerForm, TimeForm } from '@/shared/components/form';
import { Typography } from '@/shared/components/typography';
import dayjs from '@/shared/lib/time';
import { Button } from '@/shared/ui-kit/ui/button';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { cn } from '@/shared/ui-kit/utils';
import { Plus } from 'lucide-react';
import { Fragment, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { TaskFormData } from '../../validation-schema';

function TaskFormDates() {
  const startDate = useWatch<{ startDate: TaskFormData['startDate'] }>({ name: 'startDate' });
  const deadline = useWatch<{ deadline: TaskFormData['deadline'] }>({ name: 'deadline' });

  const dateLimits = getMinMaxValues({ startDate, deadline });

  const { subscribe } = useFormContext<TaskFormData>();
  useEffect(() => {
    return subscribe({
      name: ['startDate', 'deadline'],
      formState: { errors: true },
      callback: (data) => {
        const deadlineError = data.errors?.['deadline'];
        const startDateError = data.errors?.['startDate'];
        if (deadlineError || startDateError) {
          toast.error(deadlineError?.message ?? startDateError?.message, {
            position: 'top-center',
          });
        }
      },
    });
  }, [subscribe]);

  return (
    <Fragment>
      <div className="flex flex-col gap-2 items-start px-2">
        <Typography.H4 className="text-md font-normal">Начало:</Typography.H4>

        <div className="flex gap-2 items-center">
          <DatePickerForm
            name="startDate"
            isErrorMessage={false}
            min={dateLimits.startDate.min}
            max={dateLimits.startDate.max}
            renderInput={({ value, disabled }) => {
              return (
                <Button
                  className={cn({ 'size-5': value == null })}
                  disabled={disabled}
                  variant="ghost"
                  tabIndex={-1}
                >
                  {value != null ? (
                    <TaskStartDate startDate={value} size={15} showDate />
                  ) : (
                    <Plus />
                  )}
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
          <DatePickerForm
            name="deadline"
            isErrorMessage={false}
            min={dateLimits.deadline.min}
            max={dateLimits.deadline.max}
            onBeforeValueSet={(date) => dayjs(date).endOf('day').set('milliseconds', 0).toDate()}
            renderInput={({ value, disabled }) => {
              return (
                <Button
                  className={cn({ 'size-5': value == null })}
                  disabled={disabled}
                  variant="ghost"
                  tabIndex={-1}
                >
                  {value != null ? (
                    <TaskDeadlineDate deadline={value} size={15} showDate />
                  ) : (
                    <Plus />
                  )}
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

function getMinMaxValues(dates: {
  startDate: TaskFormData['startDate'];
  deadline: TaskFormData['deadline'];
}): {
  startDate: { min: Date | undefined; max: Date | undefined };
  deadline: { min: Date | undefined; max: Date | undefined };
} {
  const { deadline, startDate } = dates;

  return {
    startDate: {
      min: dayjs().subtract(1, 'day').toDate(),
      max: deadline != null ? new Date(deadline) : undefined,
    },

    deadline: {
      min: startDate != null ? dayjs(startDate).subtract(1, 'day').toDate() : dayjs().toDate(),
      max: undefined,
    },
  };
}

export { TaskFormDates };
