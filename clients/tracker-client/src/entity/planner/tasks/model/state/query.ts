const tasksDiaryQueryKeys = {
  mainKey: ['get', '/tasks/diary'] as const,
  assignableTasksKey: ['get', '/tasks/assignable'] as const,
  getDiaryTasks: (filters: { from: string; to: string }) => {
    return [...tasksDiaryQueryKeys.mainKey, { params: { query: filters } }] as const;
  },
  assignableTasks: (params: { search: string }) => {
    return [...tasksDiaryQueryKeys.assignableTasksKey, { params: { query: params } }] as const;
  },
};

export { tasksDiaryQueryKeys };
