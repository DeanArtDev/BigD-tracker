const thingsQueryKeys = {
  mainKey: ['get', '/things'] as const,
  getThings: (filters?: { from?: string; to?: string }) => {
    return [...thingsQueryKeys.mainKey, { params: { query: filters } }] as const;
  },
};

export { thingsQueryKeys };
