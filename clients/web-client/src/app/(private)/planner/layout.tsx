import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { SidebarPrefetcher } from '@/widget/planner/planner-sidebar/server';

export const metadata: Metadata = {
  title: 'Планировщик',
};

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return <SidebarPrefetcher>{children}</SidebarPrefetcher>;
}
