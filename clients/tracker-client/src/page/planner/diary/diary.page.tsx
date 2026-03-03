import { type TaskEntity } from '@/entity/planner/tasks';
import { TaskEdit } from '@/feature/planner/tasks/task-edit';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { useIsLgUp } from '@/shared/ui-kit/helpers';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { cn } from '@/shared/ui-kit/utils';
import { useState } from 'react';
import { SelectedGroupList } from './components/selected-group-list';
import { TaskDiaryManipulator } from './components/task-diary-manipulator';
import { TaskDiaryTimeline } from './components/task-diary-timeline';
import { useDiaryPageUrlQuery } from './lib/use-diary-page-url-query';

function DiaryPage() {
  const [selectedTask, setSelectedTask] = useState<TaskEntity>();
  const { pageQuery } = useDiaryPageUrlQuery();
  const isLgUp = useIsLgUp();

  return (
    <PageWrapper className="px-1" title="Ежедневник">
      <div
        className={cn(
          'task-diary-wrapper',
          'lg:border-l lg:border-r min-h-0',
          'grid max-w-full lg:p-4 pt-2 md:pt-4',
          'lg:w-full lg:max-w-[1400px] lg:mx-auto lg:grid-cols-[2fr_min-content_1fr]',
        )}
      >
        <TaskDiaryTimeline filterByGroup={pageQuery?.filter?.group} onEventClick={setSelectedTask} />

        {isLgUp && (
          <>
            <Separator orientation="vertical" className="mx-4" />

            <SelectedGroupList />
          </>
        )}
      </div>

      <TaskEdit
        taskGroupId={selectedTask?.groupId}
        task={selectedTask}
        onCansel={() => void setSelectedTask(undefined)}
        onSuccess={() => void setSelectedTask(undefined)}
      />

      <TaskDiaryManipulator />
    </PageWrapper>
  );
}

export const Component = DiaryPage;
