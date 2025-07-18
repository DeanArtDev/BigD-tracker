const groupsQueryKeys = {
  mainKey: ['get', '/groups/inbox'] as const,
  getInbox: () => {
    return [...groupsQueryKeys.mainKey] as const;
  },
};

export { groupsQueryKeys };
