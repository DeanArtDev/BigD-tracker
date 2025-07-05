const trainingsQueryKeys = {
  mainKey: ['get', '/trainings'] as const,
  getTrainingById: (params: { id?: number }) => {
    return [
      'get',
      '/trainings/{trainingId}',
      { params: { path: { trainingId: params.id ?? NaN } } },
    ] as const;
  },

  getTrainings: (filters?: { from: string; to: string }) => {
    return [...trainingsQueryKeys.mainKey, { params: { query: filters } }] as const;
  },

  getActiveTraining: () => {
    return ['get', '/trainings/active'] as const;
  },
};

export { trainingsQueryKeys };
