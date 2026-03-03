import { DatePickerForm, SwitchForm, ToggleGroupMultiForm } from '@/shared/components/form';
import { SelectForm } from '@/shared/components/form/select-form';
import { Typography } from '@/shared/components/typography';
import { Collapsible, CollapsibleContent } from '@/shared/ui-kit/ui/collapsible';
import { SelectItem } from '@/shared/ui-kit/ui/select';
import { ToggleGroupItem } from '@/shared/ui-kit/ui/toggle-group';
import { capitalize } from 'lodash-es';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { taskRecurrenceWeekdayToHumanize } from '../../../../../lib/maps';
import { TaskRecurrenceFrequency, TaskRecurrenceWeekday } from '../../../../../model';
import { useTaskFieldsRulesContext } from '../../context';
import { useValidationSchema } from '../../lib/use-validation-schema';

function TaskRecurrenceForm() {
  const { rules } = useTaskFieldsRulesContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validationSchema = useValidationSchema();
  type TaskFormData = z.input<typeof validationSchema>;
  const { resetField, subscribe } = useFormContext<TaskFormData>();

  const isRecurrence = useWatch<{ isRecurrence: TaskFormData['isRecurrence'] }>({
    name: 'isRecurrence',
  });
  const recurrence = useWatch<{ recurrence: TaskFormData['recurrence'] }>({
    name: 'recurrence',
  }) as TaskFormData['recurrence'];

  const isWeekly = recurrence?.frequency === TaskRecurrenceFrequency.WEEKLY.toString();

  useEffect(() => {
    if (isWeekly) return;
    resetField('recurrence.weekdays', {
      keepDirty: false,
      keepTouched: false,
      keepError: false,
      defaultValue: [],
    });
  }, [isWeekly, resetField]);

  useEffect(() => {
    return subscribe({
      name: ['isRecurrence'],
      formState: { values: true },
      callback: (data) => {
        if (!data.values['isRecurrence']) {
          resetField('recurrence', {
            keepDirty: false,
            keepTouched: false,
            keepError: false,
            defaultValue: null,
          });
        }
      },
    });
  }, [subscribe, resetField]);

  return (
    <div className="flex flex-col grow">
      <div className="flex justify-between grow">
        <Typography.H6>Повторять</Typography.H6>
        <SwitchForm name="isRecurrence" disabled={rules?.recurrence.isDisabled} />
      </div>

      <Collapsible open={isRecurrence}>
        <CollapsibleContent className="flex flex-col gap-2 mt-2">
          <SelectForm
            isErrorMessage={false}
            name="recurrence.frequency"
            placeholder="Частота"
            classNames={{ trigger: 'w-full bg-background' }}
          >
            <SelectItem value={TaskRecurrenceFrequency.DAILY.toString()}>Каждый день</SelectItem>
            <SelectItem value={TaskRecurrenceFrequency.WEEKLY.toString()}>Каждую неделю</SelectItem>
          </SelectForm>

          {isWeekly && (
            <ToggleGroupMultiForm
              disabled={rules?.recurrence.isDisabled}
              name="recurrence.weekdays"
              isErrorMessage={false}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value={TaskRecurrenceWeekday.MO.toString()}>
                {capitalizeWeekday(TaskRecurrenceWeekday.MO)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.TU.toString()}>
                {capitalizeWeekday(TaskRecurrenceWeekday.TU)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.WE.toString()}>
                {capitalizeWeekday(TaskRecurrenceWeekday.WE)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.TH.toString()}>
                {capitalizeWeekday(TaskRecurrenceWeekday.TH)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.FR.toString()}>
                {capitalizeWeekday(TaskRecurrenceWeekday.FR)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.SA.toString()}>
                {capitalizeWeekday(TaskRecurrenceWeekday.SA)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.SU.toString()}>
                {capitalizeWeekday(TaskRecurrenceWeekday.SU)}
              </ToggleGroupItem>
            </ToggleGroupMultiForm>
          )}

          <DatePickerForm<TaskFormData>
            name="recurrence.start"
            disabled={rules?.recurrence.isDisabled}
            isErrorMessage={false}
            label="От:"
            classNames={{ wrapper: 'flex', trigger: 'grow ml-2 max-h-[30px]' }}
          />
          <DatePickerForm<TaskFormData>
            name="recurrence.end"
            disabled={rules?.recurrence.isDisabled}
            isErrorMessage={false}
            endDay
            label="До:"
            classNames={{ wrapper: 'flex', trigger: 'grow ml-2 max-h-[30px]' }}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function capitalizeWeekday(day: TaskRecurrenceWeekday): string {
  return capitalize(taskRecurrenceWeekdayToHumanize[day]);
}

export { TaskRecurrenceForm };
