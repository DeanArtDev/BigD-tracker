import { Folder, Inbox } from 'lucide-react';
import { GroupId } from '@/entity/planner/groups';
import { usePlannerInit } from '@/shared/transport/graphql';
import { cn } from '@/shared/ui-kit';

interface GroupTaskIndicationProps {
  readonly groupId?: GroupId;
  readonly className?: string;
}

function GroupTaskIndication({ className, groupId }: GroupTaskIndicationProps) {
  const { data } = usePlannerInit();
  const inboxId = data?.inbox.id;

  if (groupId == null) return null;

  return groupId === inboxId ? (
    <Inbox className={cn('size-4', className)} />
  ) : (
    <Folder className={cn('size-4', className)} />
  );
}

export { GroupTaskIndication, type GroupTaskIndicationProps };
