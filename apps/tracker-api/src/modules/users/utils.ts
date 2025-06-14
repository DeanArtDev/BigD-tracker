function shapeUser(rawUser: {
  id: number;
  avatar: string | null;
  created_at: Date;
  email: string;
  password_hash: string;
  screen_name: string | null;
}) {
  return {
    id: rawUser.id,
    email: rawUser.email,
    screenName: rawUser.screen_name ?? undefined,
    avatar: rawUser.avatar ?? undefined,
    createdAt: rawUser.created_at.toISOString(),
  };
}

export { shapeUser };
