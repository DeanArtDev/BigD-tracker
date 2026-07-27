import { AuthIllustrationPanel } from '@/entity/auth';
import { LoginFormFeature } from '@/feature/login';
import { Main } from '../../_ui/main';

export default function LoginPage() {
  return (
    <Main className="min-h-dvh w-full bg-muted">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px]">
        <aside className="hidden w-[680px] shrink-0 items-center p-6 xl:flex">
          <AuthIllustrationPanel className="h-[calc(100dvh-48px)] min-h-[640px] max-h-[852px]" />
        </aside>

        <div className="flex flex-1 items-center justify-center px-6 py-12 xl:px-20">
          <LoginFormFeature />
        </div>
      </div>
    </Main>
  );
}
