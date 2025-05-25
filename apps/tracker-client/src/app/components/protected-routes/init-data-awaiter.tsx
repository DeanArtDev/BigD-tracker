import { useAccessTokenStore, useAuthStore, useMeSuspense } from '@/entity/auth';

function InitDataAwaiter({ children }: { children: React.ReactNode }) {
  const accessToken = useAccessTokenStore((state) => state.accessToken);
  const setIsAuth = useAuthStore((state) => state.setIsAuth);
  if (accessToken != null) {
    setIsAuth(true);
  }
  useMeSuspense();
  return children;
}

export { InitDataAwaiter };
