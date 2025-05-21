import { $publicQueryClient } from '@/shared/api/api-client';
import { useAccessTokenStore, useAuthStore } from '@/entity/auth';
import { routes } from '@/shared/lib/routes';
import { useNavigate } from 'react-router-dom';

function useSignUp() {
  const navigate = useNavigate();
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);
  const setIsAuth = useAuthStore((state) => state.setIsAuth);

  const { mutate: signUp, ...states } = $publicQueryClient.useMutation(
    'post',
    '/auth/register',
    {
      onSuccess: (data) => {
        if (data.data != null) {
          navigate(routes.gymHome.path);
          setAccessToken(data.data.token);
          setIsAuth(true);
        }
      },
    },
  );

  return { signUp, ...states };
}

export { useSignUp };
