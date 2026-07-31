import { ReactNode } from 'react';
import { PlannerSidebar } from '@/widget/planner/planner-sidebar';
import { DiaryPageHeader } from './diary-page-header';

interface DiaryPageSidebarProps {
  readonly open: boolean;
  readonly content: ReactNode;
}

function DiaryPageSidebar({ open, content }: DiaryPageSidebarProps) {
  return <PlannerSidebar defaultOpen={open} headerSlot={<DiaryPageHeader />} content={content} />;
}

export { DiaryPageSidebar, type DiaryPageSidebarProps };
