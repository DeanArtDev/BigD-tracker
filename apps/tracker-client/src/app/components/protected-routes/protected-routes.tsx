import { useAccessTokenStore } from '@/entity/auth';
import { routes } from '@/shared/lib/routes';
import { Navigate } from 'react-router-dom';
import { InitDataAwaiter } from './init-data-awaiter';
import { Suspense } from 'react';
import { PacmanLoader } from 'react-spinners';
import { MinDelayOnce } from '@/shared/ui-kit/helpers';

function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const accessToken = useAccessTokenStore((state) => state.accessToken);

  if (accessToken == null) return <Navigate to={routes.login.path} />;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <PacmanLoader className="m-auto" color="#8e51ff" size={35} />
        </div>
      }
    >
      {import.meta.env.PROD && <MinDelayOnce ms={1000} />}
      <InitDataAwaiter>{children}</InitDataAwaiter>
    </Suspense>
  );
}

export { ProtectedRoutes };
