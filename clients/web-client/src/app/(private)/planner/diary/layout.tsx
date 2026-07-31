import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { getSidebarOpen } from '../_model/server';
import { DiaryPageSidebar } from './_ui/diary-page-sidebar';

import '@dayflow/core/dist/styles.components.css';

export const metadata: Metadata = {
  title: 'Ежедневник',
};

export default async function DiaryPageLayout({ children }: Readonly<{ children: ReactNode }>) {
  const open = await getSidebarOpen();

  return <DiaryPageSidebar open={open} content={children} />;
}
