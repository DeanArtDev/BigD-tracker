import { useEffect } from 'react';
import { useDiaryUrl } from '@/app/(private)/planner/diary/_model';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { DiaryTask, GetDiaryTasksQueryVariables, useGetDiaryTasks } from '@/shared/transport/graphql';
import { useDiaryContext } from '../context';
import { DiaryDialogActions } from './diary-dialog-actions';

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
  const [diarySearch] = useDiaryUrl();

  const input: GetDiaryTasksQueryVariables['input'] | undefined =
    diarySearch != null ? { from: diarySearch.from, to: diarySearch.to } : undefined;

  const { tasks } = useGetDiaryTasks<TaskId, GroupId>(input);

  useEffect(() => {
    app.applyEventsChanges(
      {
        add: tasks.filter(hasDates).map(DiaryDialogActions.mapTaskToEvent) ?? [],
      },
      false,
      'remote',
    );
  }, [app, tasks]);
}

export { useGetTaskToDiaryEventsSync };
