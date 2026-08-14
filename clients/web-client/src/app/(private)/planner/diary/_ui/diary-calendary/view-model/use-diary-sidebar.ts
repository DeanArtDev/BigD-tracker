import { SidebarService } from '@dayflow/plugin-sidebar';
import { useDiaryContext } from '../context';

function useDiarySidebar(): SidebarService | undefined {
  const { app } = useDiaryContext();
  return app.getPlugin<SidebarService>('sidebar');
}

export { useDiarySidebar };
