const exerciseQueryKeys = {
  getExerciseTemplates: (params?: { my: boolean }) =>
    ['get', '/exercises/templates', { params: { query: params } }] as const,
};

export { exerciseQueryKeys };
