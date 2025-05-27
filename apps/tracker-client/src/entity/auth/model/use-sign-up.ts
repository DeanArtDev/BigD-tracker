import { useAccessTokenStore, useAuthStore } from '@/entity/auth';
import { $publicQueryClient } from '@/shared/api/api-client';
import { routes } from '@/shared/lib/routes';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function useSignUp() {
  const navigate = useNavigate();
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);
  const setIsAuth = useAuthStore((state) => state.setIsAuth);

  const { mutate: signUp, ...states } = $publicQueryClient.useMutation(
    'post',
    '/auth/register',
    {
      onError: (error: Error) => {
        /*Забабахать тайп гард для 409*/
        if (typeof error === 'object' && error != null && 'statusCode' in error) {
          if (error.statusCode === 409) {
            toast.error('Пользователь с таким именем или паролем уже существует');
          }
        }
      },
      onSuccess: (data) => {
        if (data.data != null) {
          setAccessToken(data.data.token);
          setIsAuth(true);
          navigate(routes.gymHome.path);
        }
      },
    },
  );

  return { signUp, ...states };
}

export { useSignUp };
