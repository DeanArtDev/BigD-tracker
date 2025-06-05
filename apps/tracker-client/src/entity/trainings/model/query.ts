const trainingsQueryKeys = {
  getTrainings: (filters?: { from: string; to: string }) => {
    return ['get', '/trainings', { params: { query: filters } }] as const;
  },
};

export { trainingsQueryKeys };
