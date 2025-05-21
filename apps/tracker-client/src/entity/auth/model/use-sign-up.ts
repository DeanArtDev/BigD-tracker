import { $publicQueryClient } from '@/shared/api/api-client';
import { useAccessTokenStore, useAuthStore } from '@/entity/auth';

function useSignUp() {
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);
  const setIsAuth = useAuthStore((state) => state.setIsAuth);

  const { mutate: signUp, ...states } = $publicQueryClient.useMutation(
    'post',
    '/auth/register',
    {
      onSuccess: (data) => {
        if (data.data != null) {
          setAccessToken(data.data.token);
          setIsAuth(true);
        }
      },
    },
  );

  return { signUp, ...states };
}

export { useSignUp };
