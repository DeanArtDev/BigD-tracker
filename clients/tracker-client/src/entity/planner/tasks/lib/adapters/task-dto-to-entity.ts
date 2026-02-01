import type { TaskEntity } from '../../model';
import type { ApiDto } from '@/shared/api/types';

function taskDtoToEntity(dto: ApiDto['TaskDto']): TaskEntity {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
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
