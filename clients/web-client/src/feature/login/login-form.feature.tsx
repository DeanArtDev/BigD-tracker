'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/entity/auth';
import { routes } from '@/shared/routes';
import { useLogin } from './api/use-login';

function LoginFormFeature() {
  const router = useRouter();
  const { login, loading } = useLogin();

  return (
    <LoginForm
      loadingButton={loading}
      onSubmit={(data) => {
        login({
          variables: { input: data },
          onCompleted: ({ userLogin: ok }) => {
            if (ok) router.push(routes.home.path);
          },
        });
      }}
    />
  );
}

export { LoginFormFeature };
