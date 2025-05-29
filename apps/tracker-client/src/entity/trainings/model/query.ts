const trainingsQueryKeys = {
  getTrainingsTemplates: () => ['get', '/trainings/templates'] as const,
  getTrainings: (filters?: { from: string; to: string }) => {
    return ['get', '/trainings', { params: { query: filters } }] as const;
  },
};

export { trainingsQueryKeys };
