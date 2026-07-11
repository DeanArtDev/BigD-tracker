import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { GroupListDrawerProvider } from '@/entity/planner/groups';
import { TaskCreateProvider } from '@/feature/planner/task-create';
import { TaskUpdateProvider } from '@/feature/planner/task-update';

export const metadata: Metadata = {
  title: 'Планировщик',
};

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <GroupListDrawerProvider>
      <TaskCreateProvider>
        <TaskUpdateProvider>{children}</TaskUpdateProvider>
      </TaskCreateProvider>
    </GroupListDrawerProvider>
  );
}
