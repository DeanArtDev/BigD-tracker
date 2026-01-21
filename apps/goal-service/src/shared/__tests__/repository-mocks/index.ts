import { TasksReadRepository } from '@/modules/tasks/application/ports';

const tasksReadRepoMock: Record<keyof TasksReadRepository, jest.Mock> = {
  getById: jest.fn(),
  getTaskToGroupLink: jest.fn(),
  isTaskIntoGroup: jest.fn(),
  getByRange: jest.fn(),
};

export { tasksReadRepoMock };
