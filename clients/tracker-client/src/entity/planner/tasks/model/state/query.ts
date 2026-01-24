const tasksDiaryQueryKeys = {
  mainKey: ['get', '/tasks/diary'] as const,
  getDiaryTasks: (filters: { from: string; to: string }) => {
    return [...tasksDiaryQueryKeys.mainKey, { params: { query: filters } }] as const;
  },
};

export { tasksDiaryQueryKeys };
