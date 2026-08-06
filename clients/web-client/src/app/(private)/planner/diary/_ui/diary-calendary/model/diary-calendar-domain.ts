import type { CalendarType } from '@dayflow/core';
import type { GroupId } from '@/entity/planner/groups';
import type { DiaryGroup } from '@/shared/transport/graphql';
import { EMPTY_GROUP_ID } from './constants';

type DiaryGroupSettings = NonNullable<DiaryGroup<GroupId>['settings']>;

interface DiaryCalendarGroup {
  readonly id: GroupId;
  readonly name: string;
  readonly settings: DiaryGroupSettings;
}

class DiaryCalendarDomain {
  static mapGroupToCalendar(group: DiaryGroup<GroupId>): CalendarType | null {
    if (group.settings == null) return null;

    return {
      id: String(group.id),
      name: group.name,
      colors: {
        eventColor: group.settings.eventColor,
        eventSelectedColor: group.settings.eventSelectedColor,
        lineColor: group.settings.lineColor,
        textColor: group.settings.textColor,
      },
      darkColors: {
        eventColor: group.settings.eventColorDark,
        eventSelectedColor: group.settings.eventSelectedColorDark,
        lineColor: group.settings.lineColorDark,
        textColor: group.settings.textColorDark,
      },
      isDefault: group.settings.isDefault,
      isVisible: group.settings.isVisible,
      readOnly: group.settings.isReadonly,
    };
  }

  static mapCalendarToGroup(calendar: CalendarType): DiaryCalendarGroup | null {
    if (calendar.id === EMPTY_GROUP_ID) return null;

    const groupId = Number(calendar.id);
    if (!Number.isFinite(groupId)) return null;

    const darkColors = calendar.darkColors ?? calendar.colors;

    return {
      id: groupId as GroupId,
      name: calendar.name,
      settings: {
        eventColor: calendar.colors.eventColor,
        eventSelectedColor: calendar.colors.eventSelectedColor,
        lineColor: calendar.colors.lineColor,
        textColor: calendar.colors.textColor,
        eventColorDark: darkColors.eventColor,
        eventSelectedColorDark: darkColors.eventSelectedColor,
        lineColorDark: darkColors.lineColor,
        textColorDark: darkColors.textColor,
        isDefault: calendar.isDefault ?? false,
        isVisible: calendar.isVisible ?? true,
        isReadonly: calendar.readOnly ?? false,
      },
    };
  }
}

export { DiaryCalendarDomain, type DiaryCalendarGroup };
