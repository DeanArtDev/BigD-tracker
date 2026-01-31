import { TaskPriority } from '@/entity/planner/tasks';

const taskPrioritySchema = Object.values(TaskPriority)
  .filter((v) => typeof v === 'number')
  .map(String);

export { taskPrioritySchema };
