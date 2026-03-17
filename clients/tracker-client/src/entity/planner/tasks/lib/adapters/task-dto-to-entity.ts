import type { ApiSchemas } from '@/shared/api/types';
import { taskDomainModule, type TaskEntity, TaskPriority, TaskStatus } from '../../model';
import { priorityToKeyMap } from '../maps';

function taskDtoToEntity(dto: ApiSchemas['TaskDto']): TaskEntity {
  return {
    id: dto.id,
    name: dto.name,
    groupId: dto.groupId,
    status: dto.status as TaskStatus,
    priority: priorityToKeyMap[dto.priority] ?? TaskPriority.DELETE,
    description: dto.description,
    endDate: dto.endDate,
    cancelReason: dto.cancelReason,
    weight: dto.weight,
    startDate: dto.startDate,
    deadline: dto.deadline,
    type: taskDomainModule.parseId(dto.id, dto.recurrence).type,
    recurrence: dto.recurrence,
  };
}

export { taskDtoToEntity };
