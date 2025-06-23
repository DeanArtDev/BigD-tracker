const trainingTemplatesQueryKeys = {
  getOneTrainingTemplates: (params: { templateId?: number }) =>
    [
      'get',
      '/trainings-templates/{templateId}',
      { params: { path: { templateId: params.templateId ?? NaN } } },
    ] as const,
  getTrainingsTemplates: (params?: { my: boolean }) =>
    ['get', '/trainings-templates', { params: { query: params } }] as const,
};

export { trainingTemplatesQueryKeys };
