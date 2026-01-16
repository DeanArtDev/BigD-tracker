import {
  GroupInboxReadRepositoryKysely,
  GroupsReadRepositoryKysely,
  TasksReadRepositoryKysely,
} from './index';

describe('read repositories index', () => {
  it('exports read repositories', () => {
    expect(GroupInboxReadRepositoryKysely).toBeDefined();
    expect(GroupsReadRepositoryKysely).toBeDefined();
    expect(TasksReadRepositoryKysely).toBeDefined();
  });
});
