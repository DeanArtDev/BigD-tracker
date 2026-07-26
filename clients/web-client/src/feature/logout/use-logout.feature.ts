import { useApolloClient } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { routes } from '@/shared/routes';
import { useLogout } from './api/use-logout';

function useLogoutFeature() {
  const client = useApolloClient();
  const router = useRouter();
  const { logout, loading } = useLogout();

  return {
    isLogoutLoading: loading,
    logout: async () => {
      await logout({
        onCompleted: async () => {
          await client.clearStore();
          router.push(routes.login.path);
        },
      });
    },
  };
}

export { useLogoutFeature };
