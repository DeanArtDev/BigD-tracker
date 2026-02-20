import { type TaskEntity, TaskStatus } from '../../model';
import type { ApiSchemas } from '@/shared/api/types';

function taskDtoToEntity(dto: ApiSchemas['TaskDto']): TaskEntity {
  return {
    id: dto.id,
    name: dto.name,
    groupId: dto.groupId,
    status: dto.status as TaskStatus,
    deadline: dto.deadline,
    priority: dto.priority,
    description: dto.description,
    endDate: dto.endDate,
    cancelReason: dto.cancelReason,
    startDate: dto.startDate,
    weight: dto.weight,
  };
}

export { taskDtoToEntity };
