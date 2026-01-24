import { TaskDeadlineDate, TaskStartDate } from '@/entity/planner/tasks/ui';
import type { ThingEditorFormData } from '../../thing-overview';
import { DatePickerForm } from '@/shared/components/form';
import { Button } from '@/shared/ui-kit/ui/button';
import { subDays } from 'date-fns';
import { Plus } from 'lucide-react';
import { Fragment } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

function DateBlock() {
  const startDate = useWatch<ThingEditorFormData>({ name: 'startDate' });
  const deadline = useWatch<ThingEditorFormData>({ name: 'deadline' });
  const { getValues, setValue } = useFormContext<ThingEditorFormData>();

  return (
    <Fragment>
      <DatePickerForm
        min={subDays(new Date(), 1)}
        max={new Date(deadline ?? '')}
        name="startDate"
        onChange={() => {
          if (getValues('startDate') == null) {
            setValue('deadline', null, { shouldDirty: false, shouldValidate: false });
          }
        }}
        renderInput={({ value }) => {
          return (
            <Button className="w-full justify-between px-2" variant="ghost">
              <span>Начало:</span>
              {value != null ? <TaskStartDate startDate={value} size={15} showDate /> : <Plus />}
            </Button>
          );
        }}
      />

      {startDate != null && (
        <DatePickerForm
          name="deadline"
          min={new Date(startDate ?? '')}
          renderInput={({ value }) => {
            return (
              <Button className="w-full justify-between px-2" variant="ghost">
                <span>Дедлайн:</span>
                {value != null ? (
                  <TaskDeadlineDate deadline={value} size={15} showDate />
                ) : (
                  <Plus />
                )}
              </Button>
            );
          }}
        />
      )}
    </Fragment>
  );
}

export { DateBlock };
