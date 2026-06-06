'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { LoginForm, useLogin } from '@/entity/auth';
import { routes } from '@/shared/routes';

function LoginFormFeature() {
  const router = useRouter();
  const { login, loading, isWrongPassOrLoginError } = useLogin();

  useEffect(() => {
    let id: string | number | undefined = undefined;
    if (isWrongPassOrLoginError) {
      toast.dismiss(id);
      id = toast.error('Неверный логин или пароль', { closeButton: true, position: 'top-center' });
    }

    return () => void toast.dismiss(id);
  }, [isWrongPassOrLoginError]);

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
