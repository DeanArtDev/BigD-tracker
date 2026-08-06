import { useEffect } from 'react';
import type { GroupId } from '@/entity/planner/groups';
import { useGetDiaryGroupList } from '@/shared/transport/graphql';
import { useDiaryContext } from '../context';
import { DiaryCalendarDomain } from './diary-calendar-domain';

function useGetGroupsToDiaryCalendarsSync() {
  const { calendar } = useDiaryContext();
  const app = calendar.app;

  const { groups } = useGetDiaryGroupList<GroupId>();

  useEffect(() => {
    const registry = app.getCalendarRegistry();

    for (const group of groups) {
      const calendar = DiaryCalendarDomain.mapGroupToCalendar(group);
      if (calendar == null) continue;

      if (registry.has(calendar.id)) {
        registry.updateCalendar(calendar.id, calendar);
      } else {
        registry.register(calendar);
      }
    }

    app.triggerRender();
  }, [app, groups]);
}

export { useGetGroupsToDiaryCalendarsSync };
