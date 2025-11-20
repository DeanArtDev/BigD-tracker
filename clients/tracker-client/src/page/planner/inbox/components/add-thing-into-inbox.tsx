import { useInvalidateInbox } from '@/entity/planner/groups';
import { useCreateThingIntoInbox, useInvalidateThings } from '@/entity/planner/things';
import { AddThingDialog } from '@/entity/planner/things/ui';
import { DatePickerForm } from '@/shared/components/form';
import { subDays } from 'date-fns';

function AddThingIntoInbox() {
  const { createThing, isPending } = useCreateThingIntoInbox();
  const invalidateThings = useInvalidateThings();
  const invalidateInbox = useInvalidateInbox();

  return (
    <AddThingDialog
      loading={isPending}
      dateSlot={(form) => (
        <div className="grid gap-4 grid-cols-2">
          <DatePickerForm
            label="Дата начала"
            name="startDate"
            min={subDays(new Date(), 1)}
            onChange={() => void form.setValue('deadline', undefined, { shouldDirty: false })}
          />

          <DatePickerForm
            label="Дедлайн"
            name="deadline"
            min={new Date(form.getValues('startDate') ?? '')}
          />
        </div>
      )}
      onSubmit={(formResult, { close }) => {
        createThing(
          { body: { data: formResult } },
          {
            onSuccess: () => {
              invalidateInbox();
              invalidateThings();
              close();
            },
          },
        );
      }}
    />
  );
}

export { AddThingIntoInbox };
