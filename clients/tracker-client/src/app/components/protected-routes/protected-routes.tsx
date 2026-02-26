import { InitDataAwaiter } from './init-data-awaiter';

function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  return <InitDataAwaiter>{children}</InitDataAwaiter>;
}

export { ProtectedRoutes };
