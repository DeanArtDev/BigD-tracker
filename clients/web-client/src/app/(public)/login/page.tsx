import { LoginFormFeature } from '@/feature/login';
import { Main } from '../../_ui/main';

export default function LoginPage() {
  return (
    <Main>
      <div className="flex mx-auto w-full max-w-[1440px] items-center">
        <div className="flex-1/2">
          <div className="bg-linear-to-bl grow from-indigo-400 to-violet-800 mb-auto mr-auto rounded-xl h-[760px] w-[560px]"></div>
        </div>
        <div className="flex-1/2 items-center justify-center p-5">
          <LoginFormFeature />
        </div>
      </div>
    </Main>
  );
}
