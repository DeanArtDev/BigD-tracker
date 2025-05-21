import { useAccessTokenStore, useAuthStore, useMeSuspense } from '@/entity/auth';

function InitDataAwaiter({ children }: { children: React.ReactNode }) {
  const accessToken = useAccessTokenStore((state) => state.accessToken);
  const setIsAuth = useAuthStore((state) => state.setIsAuth);
  useMeSuspense({ enabled: accessToken == null });
  if (accessToken != null) {
    setIsAuth(true);
  }
  return children;
}

export { InitDataAwaiter };
