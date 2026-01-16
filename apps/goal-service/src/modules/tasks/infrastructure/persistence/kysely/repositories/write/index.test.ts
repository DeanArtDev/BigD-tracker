import {
  GroupInboxWriteRepositoryKysely,
  GroupWriteRepositoryKysely,
  TasksWriteRepositoryKysely,
} from './index';

describe('write repositories index', () => {
  it('exports write repositories', () => {
    expect(GroupInboxWriteRepositoryKysely).toBeDefined();
    expect(GroupWriteRepositoryKysely).toBeDefined();
    expect(TasksWriteRepositoryKysely).toBeDefined();
  });
});
