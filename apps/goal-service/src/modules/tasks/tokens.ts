const TasksToken = {
  WRITE_REPOSITORY: Symbol('TASKS_WRITE_REPOSITORY'),
  READ_REPOSITORY: Symbol('TASKS_READ_REPOSITORY'),
};

const GroupsToken = {
  WRITE_REPOSITORY: Symbol('GROUPS_WRITE_REPOSITORY'),
  READ_REPOSITORY: Symbol('GROUPS_READ_REPOSITORY'),
};

export { TasksToken, GroupsToken };
