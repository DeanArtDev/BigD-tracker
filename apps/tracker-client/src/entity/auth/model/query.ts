const authQueryKeys = {
  me: () => ['get', '/users/me'] as const,
  users: () => ['get', '/users/users'] as const,
};

export { authQueryKeys };
