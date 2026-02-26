import { useQueryClient } from '@tanstack/react-query';

function useDropEverything() {
  const queryClient = useQueryClient();

  return () => {
    return queryClient.clear();
  };
}

export { useDropEverything };
