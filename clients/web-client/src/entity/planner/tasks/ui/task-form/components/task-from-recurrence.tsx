import { capitalize } from 'lodash-es';
import { useFormContext, useWatch } from 'react-hook-form';
import { TaskFormData } from '@/entity/planner/tasks';
import { RecurrenceFrequency, TaskRecurrenceWeekday } from '@/shared/transport/graphql';
import { cn, Collapsible, CollapsibleContent, ToggleGroupItem, Typography } from '@/shared/ui-kit';
import { SwitchForm, ToggleGroupForm, ToggleGroupMultiForm } from '@/shared/ui-kit/form';
import { taskRecurrenceWeekdayToHumanize } from '../constants';
import { UntilBlock } from './until-block';
import { GroupBrand } from '../context/task-form-provider';

function TaskFromRecurrence<TGroupId extends GroupBrand>() {
  const { control, resetField, clearErrors, setValue } = useFormContext<TaskFormData<TGroupId>>();
  const [isRecurrence, frequency] = useWatch({ control, name: ['isRecurrence', 'frequency'] });
  const isWeekly = frequency === RecurrenceFrequency.Weekly;

  return (
    <div className="flex flex-col grow">
      <div className="grid grid-cols-[min-content_min-content] gap-2 items-center">
        <Typography.H6>Повторяемость</Typography.H6>
        <SwitchForm
          name="isRecurrence"
          onCheckedChange={() => {
            clearErrors(['untilDate', 'weekdays']);
            setValue('frequency', RecurrenceFrequency.Daily, { shouldDirty: false, shouldValidate: false });
            resetField('frequency', { defaultValue: RecurrenceFrequency.Daily });
          }}
        />
      </div>

      <Collapsible open={Boolean(isRecurrence)}>
        <CollapsibleContent
          className={cn(
            'flex flex-col gap-2 mt-2',
            'overflow-hidden',
            'data-[state=open]:animate-collapsible-down',
            'data-[state=closed]:animate-collapsible-up',
          )}
        >
          <ToggleGroupForm
            name="frequency"
            isErrorMessage={false}
            className="**:data-[state=on]:bg-primary **:data-[state=off]:bg-background **:data-[state=on]:text-white"
          >
            <ToggleGroupItem value={RecurrenceFrequency.Daily} variant="outline">
              Каждый день
            </ToggleGroupItem>

            <ToggleGroupItem value={RecurrenceFrequency.Weekly} variant="outline">
              Каждую неделю
            </ToggleGroupItem>

            <ToggleGroupItem value={RecurrenceFrequency.Monthly} disabled variant="outline">
              Раз в месяц
            </ToggleGroupItem>
          </ToggleGroupForm>

          {isWeekly && (
            <ToggleGroupMultiForm
              name="weekdays"
              className={cn(
                '**:data-[slot=toggle-group-item]:rounded-lg',
                '**:data-[state=on]:bg-primary **:data-[state=on]:text-primary-foreground **:data-[state=on]:hover:bg-primary',
                '**:data-[state=off]:bg-background **:data-[state=off]:text-foreground',
              )}
              size="sm"
              isErrorMessage={false}
              variant="outline"
            >
              <ToggleGroupItem value={TaskRecurrenceWeekday.Mo}>
                {capitalizeWeekday(TaskRecurrenceWeekday.Mo)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.Tu}>
                {capitalizeWeekday(TaskRecurrenceWeekday.Tu)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.We}>
                {capitalizeWeekday(TaskRecurrenceWeekday.We)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.Th}>
                {capitalizeWeekday(TaskRecurrenceWeekday.Th)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.Fr}>
                {capitalizeWeekday(TaskRecurrenceWeekday.Fr)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.Sa}>
                {capitalizeWeekday(TaskRecurrenceWeekday.Sa)}
              </ToggleGroupItem>
              <ToggleGroupItem value={TaskRecurrenceWeekday.Su}>
                {capitalizeWeekday(TaskRecurrenceWeekday.Su)}
              </ToggleGroupItem>
            </ToggleGroupMultiForm>
          )}

          <UntilBlock />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function capitalizeWeekday(day: TaskRecurrenceWeekday): string {
  return capitalize(taskRecurrenceWeekdayToHumanize[day]);
}

export { TaskFromRecurrence };
