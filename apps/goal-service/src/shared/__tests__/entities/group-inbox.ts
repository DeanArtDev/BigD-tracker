import { GroupInboxView } from '@/modules/tasks/application/dto';
import { TaskView } from '@/modules/tasks/application/dto/task.view';

const getGroupInboxView = (
  data: Partial<{
    id: number;
    userId: number;
    name: string;
    tasks: TaskView[];
  }> = {},
): GroupInboxView => {
  return GroupInboxView.restore({
    id: data.id ?? 1,
    userId: data.userId ?? 1,
    name: data.name ?? 'Inbox',
    tasks: data.tasks ?? [],
  });
};

export { getGroupInboxView };
