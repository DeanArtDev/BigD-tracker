import { Suspense } from 'react';
import { PacmanLoader } from 'react-spinners';
import { InitDataAwaiter } from './init-data-awaiter';

function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grow h-dvh flex flex-col">
          <PacmanLoader className="m-auto" color="#8e51ff" size={35} />
        </div>
      }
    >
      <InitDataAwaiter>{children}</InitDataAwaiter>
    </Suspense>
  );
}

export { ProtectedRoutes };
