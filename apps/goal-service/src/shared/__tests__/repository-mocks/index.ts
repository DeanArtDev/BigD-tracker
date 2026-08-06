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
  getSettings: jest.fn(),
  getManySettings: jest.fn(),
  getManyVirtualTaskSettings: jest.fn(),
  isTaskIntoGroup: jest.fn(),
  getByRange: jest.fn(),
  getMany: jest.fn(),
};

const tasksWriteRepoMock: Record<keyof TasksWriteRepository, jest.Mock> = {
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  replaceTask: jest.fn(),
  updateSettings: jest.fn(),
};

const tasksOverridesWriteRepoMock: Record<keyof TasksOverridesRepositoryWritePort, jest.Mock> = {
  getSettings: jest.fn(),
  getManySettings: jest.fn(),
  getManyRecurrences: jest.fn(),
  getManyOverrides: jest.fn(),
  getOneRecurrence: jest.fn(),
  getOneOverride: jest.fn(),
  upsertOverride: jest.fn(),
  upsertRecurrence: jest.fn(),
  updateGroupIdForManyOverride: jest.fn(),
  deleteRecurrence: jest.fn(),
  deleteManyOverride: jest.fn(),
  updateOverride: jest.fn(),
  updateRecurrence: jest.fn(),
  updateSettings: jest.fn(),
};

const groupWriteRepoMock: Record<keyof GroupsWriteRepository, jest.Mock> = {
  createGroup: jest.fn(),
  delete: jest.fn(),
  getGroup: jest.fn(),
  updateGroupAndTaskOrder: jest.fn(),
  updateSettings: jest.fn(),
};

const groupReadRepoMock: Record<keyof GroupsReadRepository, jest.Mock> & { getGroupDetailed: jest.Mock } = {
  getByName: jest.fn(),
  getGroupDetailed: jest.fn(),
  ensureTaskInGroup: jest.fn(),
  getInfoGroups: jest.fn(),
  getGroupInfo: jest.fn(),
  getSettings: jest.fn(),
  getManySettings: jest.fn(),
  getMany: jest.fn(),
  getOne: jest.fn(),
};

const inboxReadRepoMock: Record<keyof GroupInboxReadRepository, jest.Mock> = {
  getInboxByUserId: jest.fn(),
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
