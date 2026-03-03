import {
  GroupInboxReadRepository,
  GroupInboxWriteRepository,
  GroupsReadRepository,
  GroupsWriteRepository,
  GoalsReadRepository,
  TasksOverridesRepositoryWritePort,
  TasksReadRepository,
  TasksWriteRepository,
} from '@/modules/tasks/application/ports';

const tasksReadRepoMock: Record<keyof TasksReadRepository, jest.Mock> = {
  getById: jest.fn(),
  isTaskIntoGroup: jest.fn(),
  getByRange: jest.fn(),
  getMany: jest.fn(),
};

const tasksWriteRepoMock: Record<keyof TasksWriteRepository, jest.Mock> = {
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  changeTaskStatus: jest.fn(),
  replaceTask: jest.fn(),
  addTaskToGroup: jest.fn(),
  removeTaskFromGroup: jest.fn(),
};

const tasksOverridesWriteRepoMock: Record<keyof TasksOverridesRepositoryWritePort, jest.Mock> = {
  getManyMasterEvents: jest.fn(),
  getManyOverrides: jest.fn(),
};

const groupWriteRepoMock: Record<keyof GroupsWriteRepository, jest.Mock> = {
  createGroup: jest.fn(),
  delete: jest.fn(),
  getGroupById: jest.fn(),
  replaceGroupWithTasks: jest.fn(),
};

const groupReadRepoMock: Record<keyof GroupsReadRepository, jest.Mock> = {
  getByName: jest.fn(),
  getGroup: jest.fn(),
  getGroupDetailed: jest.fn(),
  getGroupWithTasksById: jest.fn(),
  ensureTaskInGroup: jest.fn(),
  getGroupListWithTasks: jest.fn(),
  getInfoGroups: jest.fn(),
};

const inboxReadRepoMock: Record<keyof GroupInboxReadRepository, jest.Mock> = {
  getInboxWithTasksByUserId: jest.fn(),
  ensureTaskInInbox: jest.fn(),
};

const inboxWriteRepoMock: Record<keyof GroupInboxWriteRepository, jest.Mock> = {
  createInbox: jest.fn(),
};

const goalsReadRepoMock: Record<keyof GoalsReadRepository, jest.Mock> = {
  getGoalInfoByChildGroups: jest.fn(),
};

export {
  groupReadRepoMock,
  groupWriteRepoMock,
  inboxReadRepoMock,
  inboxWriteRepoMock,
  goalsReadRepoMock,
  tasksOverridesWriteRepoMock,
  tasksReadRepoMock,
  tasksWriteRepoMock,
};
