const trainingTemplatesQueryKeys = {
  getTrainingsTemplates: (params?: { my: boolean }) =>
    ['get', '/trainings/templates', { params: { query: params } }] as const,
};

export { trainingTemplatesQueryKeys };
