import { TasksDB } from '@/modules/tasks/application/ports';
import { specificationCombinatorFactory, SpecificationObject } from '@big-d/api-utils';

type TasksSpecification = SpecificationObject<TasksDB>;

const tasksCombinators = specificationCombinatorFactory<TasksDB>('tasks');
const groupsCombinators = specificationCombinatorFactory<TasksDB>('groups');

export { tasksCombinators, groupsCombinators, TasksSpecification };
