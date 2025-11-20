import { useInvalidateInbox } from '@/entity/planner/groups';
import { useCreateThing, useInvalidateThings } from '@/entity/planner/things';
import { AddThingDialog } from '@/entity/planner/things/ui';
import { DateElements } from './date-elements';

function AddDailyThing({ thingFilters }: { thingFilters?: { from?: string; to?: string } }) {
  const { createThing, isPending } = useCreateThing();
  const invalidateInbox = useInvalidateInbox();
  const invalidateThings = useInvalidateThings();

  return (
    <AddThingDialog
      loading={isPending}
      dateSlot={<DateElements dateSet={thingFilters} />}
      onSubmit={(formResult, { close }) => {
        createThing(
          { body: { data: formResult } },
          {
            onSuccess: async () => {
              await invalidateInbox();
              await invalidateThings();
              close();
            },
          },
        );
      }}
    />
  );
}

export { AddDailyThing };
