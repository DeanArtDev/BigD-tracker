import { ViewType } from '@dayflow/core';
import { useEffect, useEffectEvent } from 'react';
import { useDiaryUrl } from '@/app/(private)/planner/diary/_model';
import { useIsMounted } from '@/shared/lib/application-status';
import timeAndDate from '@/shared/lib/time';
import { useDiaryContext } from '../../context';
import { diaryViewRangeMap } from '../constants';

function useChangeRangeWatch() {
  const { calendar } = useDiaryContext();
  const [diarySearch, setDiarySearch] = useDiaryUrl();

  const app = calendar?.app;

  const diarySearchEvent = useEffectEvent(() => diarySearch);

  const isMounted = useIsMounted();
  useEffect(() => {
    const unsubscribe = app.subscribeVisibleRangeChange(({ end, start, view }) => {
      setDiarySearch((prev) => ({
        ...prev,
        view: view as ViewType,
        from: timeAndDate(start).format(diaryViewRangeMap.format),
        to: timeAndDate(end).format(diaryViewRangeMap.format),
      }));
    });

    if (!isMounted && diarySearchEvent() == null) {
      const type = app.getCurrentView().type as ViewType;
      if (type === ViewType.RESOURCE) return;
      const currentDate = timeAndDate();
      const { from, to } = diaryViewRangeMap[type](currentDate);
      app.emitVisibleRange(timeAndDate(from).toDate(), timeAndDate(to).toDate(), 'initial');
    }

    return () => unsubscribe();
  }, [app, isMounted, setDiarySearch]);
}

export { useChangeRangeWatch };
