const groupsQueryKeys = {
  mainKey: ['get', '/groups'] as const,
  inboxKey: ['get', '/groups/inbox'] as const,
  getInbox: () => [...groupsQueryKeys.inboxKey] as const,
  getGroups: () => [...groupsQueryKeys.mainKey] as const,
};

export { groupsQueryKeys };
