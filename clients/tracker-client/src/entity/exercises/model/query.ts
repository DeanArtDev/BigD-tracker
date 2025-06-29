const exerciseQueryKeys = {
  getExerciseTemplates: (params?: { my: boolean }) =>
    ['get', '/exercises/templates', { params: { query: params } }] as const,
  getExerciseTemplateById: (params: { id?: number }) =>
    [
      'get',
      '/exercises/{exerciseId}/repetitions',
      { params: { path: { exerciseId: params.id ?? NaN } } },
    ] as const,
};

export { exerciseQueryKeys };
