import { toast } from 'sonner';

function useDevNotifications() {
  return {
    inDev: () => toast.warning('Покашо в разработке 🏗️'),
  };
}

export { useDevNotifications };
