import { GroupInfoView } from '@/modules/tasks/application/dto';

const getGroupInfoView = (data: Partial<{ id: number; name: string }> = {}): GroupInfoView => {
  return GroupInfoView.restore({
    id: data.id ?? 1,
    name: data.name ?? 'group name',
  });
};

export { getGroupInfoView };
