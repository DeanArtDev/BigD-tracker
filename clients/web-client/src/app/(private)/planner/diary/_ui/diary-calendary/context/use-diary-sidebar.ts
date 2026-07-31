import { SidebarService } from '@dayflow/plugin-sidebar';
import { useDiaryContext } from './context';

function useDiarySidebar(): SidebarService | undefined {
  const { calendar } = useDiaryContext();
  return calendar.app.getPlugin<SidebarService>('sidebar');
}

export { useDiarySidebar };
