import { TaskPriority } from '@/entity/planner/tasks';
import { type TaskEntity, TaskStatus } from '../../model';
import type { ApiSchemas } from '@/shared/api/types';

function taskDtoToEntity(dto: ApiSchemas['TaskDto']): TaskEntity {
  const priorityMap: Record<string, TaskPriority> = {
    1: TaskPriority.DO,
    2: TaskPriority.PLAN,
    3: TaskPriority.DELEGATE,
    4: TaskPriority.DELETE,
  };

  return {
    id: dto.id,
    name: dto.name,
    groupId: dto.groupId,
    status: dto.status as TaskStatus,
    priority: priorityMap[dto.priority] ?? TaskPriority.DELETE,
    description: dto.description,
    endDate: dto.endDate,
    cancelReason: dto.cancelReason,
    weight: dto.weight,
    startDate: dto.startDate,
    deadline: dto.deadline,
    recurrence: dto.recurrence,
  };
}

export { taskDtoToEntity };
