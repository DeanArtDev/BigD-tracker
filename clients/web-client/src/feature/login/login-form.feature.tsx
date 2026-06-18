'use client';

import { useRouter } from 'next/navigation';
import { LoginForm, useLogin } from '@/entity/auth';
import { routes } from '@/shared/routes';

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
