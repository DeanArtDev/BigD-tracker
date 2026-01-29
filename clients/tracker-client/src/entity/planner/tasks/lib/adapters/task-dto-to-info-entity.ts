import type { TaskInfoEntity } from '../../model';
import type { ApiDto } from '@/shared/api/types';

function taskDtoToInfoEntity(dto: ApiDto['TaskDto']): TaskInfoEntity {
  return {
    id: dto.id,
    status: dto.status,
    deadline: dto.deadline,
    priority: dto.priority,
  };
}

export { taskDtoToInfoEntity };
