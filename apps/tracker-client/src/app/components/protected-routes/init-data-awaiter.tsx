import { useAccessTokenStore, useMeSuspense } from '@/entity/auth';
import { Outlet } from 'react-router-dom';

function InitDataAwaiter() {
  const accessToken = useAccessTokenStore((state) => state.accessToken);
  useMeSuspense({ enabled: accessToken == null });
  return <Outlet />;
}

export { InitDataAwaiter };
