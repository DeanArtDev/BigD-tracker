const trainingsQueryKeys = {
  mainKey: ['get', '/trainings'] as const,
  getTrainings: (filters?: { from: string; to: string }) => {
    return [...trainingsQueryKeys.mainKey, { params: { query: filters } }] as const;
  },
};

export { trainingsQueryKeys };
