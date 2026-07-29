import { Suspense } from 'react';
import { DataLoader } from '@/shared/ui-kit';
import { TasksPageContent } from './_ui/tasks-page-content';

export default function TasksPage() {
  return (
    <Suspense fallback={<DataLoader.Loading />}>
      <TasksPageContent />
    </Suspense>
  );
}
