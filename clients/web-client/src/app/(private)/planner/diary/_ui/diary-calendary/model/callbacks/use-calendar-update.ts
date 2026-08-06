import type { CalendarCallbacks, CalendarType } from '@dayflow/core';
import { useCallback } from 'react';
import type { GroupId } from '@/entity/planner/groups';
import { useGroupSettingsUpdate } from '@/feature/planner/group-settings-update';
import { useGetDiaryGroupList } from '@/shared/transport/graphql';
import { useDiaryContext } from '../../context';
import { DiaryCalendarDomain } from '../diary-calendar-domain';

function useCalendarUpdate(): CalendarCallbacks['onCalendarUpdate'] {
  const {
    calendar: { app },
  } = useDiaryContext();
  const { updateGroupSettings } = useGroupSettingsUpdate();
  const { groups } = useGetDiaryGroupList<GroupId>();

  return useCallback(
    (calendar: CalendarType) => {
      const updatedGroup = DiaryCalendarDomain.mapCalendarToGroup(calendar);
      if (updatedGroup == null) return;

      const previousGroup = groups.find(({ id }) => id === updatedGroup.id);
      const previousCalendar = previousGroup && DiaryCalendarDomain.mapGroupToCalendar(previousGroup);

      void updateGroupSettings({
        variables: {
          input: {
            groupId: updatedGroup.id,
            ...updatedGroup.settings,
          },
        },
      }).catch(() => {
        if (previousCalendar != null) app.updateCalendar(calendar.id, previousCalendar, true);
      });
    },
    [app, groups, updateGroupSettings],
  );
}

export { useCalendarUpdate };
