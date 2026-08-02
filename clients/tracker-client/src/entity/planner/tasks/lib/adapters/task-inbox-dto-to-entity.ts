import type { ApiSchemas } from '@/shared/api/types';
import { taskDomainModule, type TaskInboxEntity, TaskPriority, TaskStatus } from '../../model';
import { priorityToKeyMap } from '../maps';

function taskInboxDtoToEntity(dto: ApiSchemas['TaskDto']): TaskInboxEntity {
  return {
    id: dto.id,
    name: dto.name,
    groupId: dto.groupId,
    status: dto.status as TaskStatus,
    priority: priorityToKeyMap[dto.priority] ?? TaskPriority.DELETE,
    description: dto.description,
    startDate: dto.startDate,
    deadline: dto.deadline,
    type: taskDomainModule.parseId(dto.id, dto.recurrence).type,
    recurrence: dto.recurrence,
  };
}

export { taskInboxDtoToEntity };
