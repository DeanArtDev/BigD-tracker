const groupsQueryKeys = {
  mainKey: ['get', `/groups`] as const,
  assignable: ['get', `/groups/assignable`] as const,
  inboxKey: ['get', '/groups/inbox'] as const,
  byId: ['get', '/groups/{groupId}/detailed'] as const,
  getInbox: () => [...groupsQueryKeys.inboxKey] as const,
  getGroupsAssignable: () => [...groupsQueryKeys.assignable] as const,
  getGroupById: (params: { groupId: number }) =>
    [...groupsQueryKeys.byId, { params: { path: params } }] as const,
  getGroups: (query?: { search?: string; limit?: number }) =>
    [...groupsQueryKeys.mainKey, { params: { query } }] as const,
};

export { groupsQueryKeys };
