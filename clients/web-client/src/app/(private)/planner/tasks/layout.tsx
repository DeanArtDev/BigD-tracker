import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { getSidebarOpen } from '../_model/server';
import { TasksPageSidebar } from './_ui/tasks-page-sidebar';

export const metadata: Metadata = {
  title: 'Дела',
};

export default async function TasksPageLayout({ children }: Readonly<{ children: ReactNode }>) {
  const open = await getSidebarOpen();

  return <TasksPageSidebar open={open} content={children} />;
}
