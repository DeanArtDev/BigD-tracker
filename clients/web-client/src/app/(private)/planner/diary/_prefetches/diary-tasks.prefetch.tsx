import { ViewType } from '@dayflow/core';
import { type ReactNode, Suspense } from 'react';
import timeAndDate from '@/shared/lib/time';
import { GetDiaryTasksQueryVariables, shapeGetDiaryTasksOptions } from '@/shared/transport/graphql';
import { PreloadQuery } from '@/shared/transport/graphql/server';
import { DataLoader } from '@/shared/ui-kit';
import { UseDiaryUrl } from '../_model';
import { diaryViewRangeMap } from '../_ui/diary-calendary/model/seriver';

function DiaryTasksPrefetch({
  input,
  view,
  children,
}: {
  readonly children: ReactNode;
  readonly input?: GetDiaryTasksQueryVariables['input'];
  readonly view?: UseDiaryUrl['view'];
}) {
  return (
    <Suspense fallback={<DataLoader.Loading />}>
      <DiaryTasksPreload input={input} view={view}>
        {children}
      </DiaryTasksPreload>
    </Suspense>
  );
}

async function DiaryTasksPreload({
  children,
  input,
  view,
}: {
  readonly children: ReactNode;
  readonly input?: GetDiaryTasksQueryVariables['input'];
  readonly view?: UseDiaryUrl['view'];
}) {
  function getInput() {
    if (input != null) return input;
    if (view != null && view !== ViewType.RESOURCE) {
      const currentDate = timeAndDate();
      return diaryViewRangeMap[view](currentDate);
    }
    const currentDate = timeAndDate();
    return diaryViewRangeMap[ViewType.DAY](currentDate);
  }
  const [query, options] = shapeGetDiaryTasksOptions(getInput()).query();

  return (
    <PreloadQuery
      query={query}
      variables={options.variables}
      errorPolicy={options.errorPolicy}
      context={options.context}
    >
      {children}
    </PreloadQuery>
  );
}

export { DiaryTasksPrefetch };
