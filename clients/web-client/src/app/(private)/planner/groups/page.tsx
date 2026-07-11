import { GroupsPageContent } from './_ui/groups-page-content';
import { getSidebarOpen } from '../_model/server';
import { GroupsPageSidebar } from './_ui/groups-page-sidebar';

export default async function PlannerPage() {
  const open = await getSidebarOpen();

  return <GroupsPageSidebar open={open} content={<GroupsPageContent />} />;
}
