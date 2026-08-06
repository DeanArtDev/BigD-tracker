import { useDiaryUrl } from '@/app/(private)/planner/diary/_model';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { GetDiaryTasksQueryVariables, useGetDiaryTasks } from '@/shared/transport/graphql';

function useGetDiaryTasksByUrl() {
  const [diarySearch] = useDiaryUrl();

  const input: GetDiaryTasksQueryVariables['input'] | undefined =
    diarySearch != null ? { from: diarySearch.from, to: diarySearch.to } : undefined;

  return useGetDiaryTasks<TaskId, GroupId>(input);
}

export { useGetDiaryTasksByUrl };
