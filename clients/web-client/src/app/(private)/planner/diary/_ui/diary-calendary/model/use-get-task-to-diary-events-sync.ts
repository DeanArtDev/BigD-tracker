import { useEffect } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { DiaryTask } from '@/shared/transport/graphql';
import { useGetDiaryTasksByUrl } from './use-get-diary-tasks-by-url';
import { useDiaryContext } from '../context';
import { DiaryEventDomain } from './diary-event-domain';

type DiaryTaskWithDates = DiaryTask<GroupId, TaskId> & {
  readonly deadline: string;
  readonly startDate: string;
};

function hasDates(task: DiaryTask<GroupId, TaskId>): task is DiaryTaskWithDates {
  return task.startDate != null && task.deadline != null;
}

function useGetTaskToDiaryEventsSync() {
  const { calendar } = useDiaryContext();
  const app = calendar.app;

  const { tasks } = useGetDiaryTasksByUrl();

  useEffect(() => {
    app.applyEventsChanges(
      {
        add: tasks.filter(hasDates).map(DiaryEventDomain.mapTaskToEvent) ?? [],
      },
      false,
      'remote',
    );
  }, [app, tasks]);
}

export { useGetTaskToDiaryEventsSync };
