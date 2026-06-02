'use client';

import { useMeSuspenseQuery, UserSettingsView } from '@/entity/user';
import { useLogoutFeature } from '@/feature/logout';

function UserSettings({ className }: { className?: string }) {
  const { me } = useMeSuspenseQuery();
  const { logout, isLogoutLoading } = useLogoutFeature();

  return <UserSettingsView email={me?.email} disabled={isLogoutLoading} className={className} onLogout={logout} />;
}

export { UserSettings };
