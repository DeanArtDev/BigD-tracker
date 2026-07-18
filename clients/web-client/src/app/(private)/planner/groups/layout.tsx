import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { getSidebarOpen } from '../_model/server';
import { GroupsPageSidebar } from './_ui/groups-page-sidebar';

export const metadata: Metadata = {
  title: 'Группы',
};

export default async function GroupPageLayout({ children }: Readonly<{ children: ReactNode }>) {
  const open = await getSidebarOpen();

  return <GroupsPageSidebar open={open} content={children} />;
}
