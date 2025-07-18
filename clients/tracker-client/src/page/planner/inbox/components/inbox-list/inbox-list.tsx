import { useInboxQuery, useInvalidateInbox } from '@/entity/planner/groups';
import { useUpdateThing } from '@/entity/planner/things';
import { DeleteTemplate } from '@/entity/planner/things/ui';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { Button } from '@/shared/ui-kit/ui/button';
import { Skeleton } from '@/shared/ui-kit/ui/skeleton';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import { ThingOverviewDialog } from './thing-overview-dialog';

const ThingCardMobileLazy = withLazy(
  () =>
    import('@/entity/planner/things/ui/thing-card-mobile').then((m) => ({
      default: m.ThingCardMobile,
    })),
  <Skeleton className="h-10 w-full rounded-md" />,
);

const ThingCardLazy = withLazy(
  () =>
    import('@/entity/planner/things/ui/thing-card').then((m) => ({
      default: m.ThingCard,
    })),
  <Skeleton className="h-10 w-full rounded-md" />,
);

function InboxList() {
  const { inbox } = useInboxQuery();
  const [thingId, setThingId] = useState<number>();
  const { updateThing, isPending } = useUpdateThing();
  const invalidateInbox = useInvalidateInbox();

  const isMobile = useIsMobile();

  return (
    <>
      <ul className="flex flex-col gap-1 sm:gap-2 justify-center w-full">
        {inbox?.things.map((i) =>
          isMobile ? (
            <ThingCardMobileLazy
              key={i.id}
              thing={i}
              onSuccess={invalidateInbox}
              onClick={({ id }) => setThingId(id)}
            />
          ) : (
            <ThingCardLazy
              key={i.id}
              thing={i}
              actionsSlot={
                <div
                  className="contents"
                  onClick={(evt) => {
                    evt.stopPropagation();
                  }}
                >
                  <DeleteTemplate thingId={i.id} onSuccess={invalidateInbox}>
                    {({ isLoading }) => (
                      <Button
                        size="icon"
                        className="my-auto w-7 h-7 opacity-0 group-hover:opacity-100"
                        variant="ghost"
                        disabled={isLoading}
                        onClick={(evt) => void evt.stopPropagation()}
                      >
                        <Trash />
                      </Button>
                    )}
                  </DeleteTemplate>
                </div>
              }
              onClick={({ id }) => void setThingId(id)}
            />
          ),
        )}
      </ul>

      <ThingOverviewDialog
        thingId={thingId}
        isLoading={isPending}
        onChange={(thing) => {
          updateThing(
            {
              params: { path: { thingId: thing.id } },
              body: {
                data: {
                  name: thing.name,
                  deadline: thing.deadline,
                  description: thing.description,
                  priority: thing.priority,
                  startDate: thing.startDate,
                },
              },
            },
            {
              onSuccess: invalidateInbox,
            },
          );
        }}
        onOpenChange={(open) => {
          if (isPending) return;
          !open && setThingId(undefined);
        }}
      />
    </>
  );
}

export { InboxList };
