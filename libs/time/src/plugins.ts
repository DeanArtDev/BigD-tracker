import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isToday from 'dayjs/plugin/isToday.js';
import isTomorrow from 'dayjs/plugin/isTomorrow.js';
import isYesterday from 'dayjs/plugin/isYesterday.js';
import minMax from 'dayjs/plugin/minMax.js';
import timezone from 'dayjs/plugin/timezone.js';
import toObject from 'dayjs/plugin/toObject.js';
import utc from 'dayjs/plugin/utc.js';

import type IsBetweenPlugin from 'dayjs/plugin/isBetween.js';
import type IsSameOrAfterPlugin from 'dayjs/plugin/isSameOrAfter.js';
import type IsSameOrBeforePlugin from 'dayjs/plugin/isSameOrBefore.js';
import type IsTodayPlugin from 'dayjs/plugin/isToday.js';
import type IsTomorrowPlugin from 'dayjs/plugin/isTomorrow.js';
import type IsYesterdayPlugin from 'dayjs/plugin/isYesterday.js';
import type MinMaxPlugin from 'dayjs/plugin/minMax.js';
import type TimezonePlugin from 'dayjs/plugin/timezone.js';
import type ToObjectPlugin from 'dayjs/plugin/toObject.js';
import type UtcPlugin from 'dayjs/plugin/utc.js';
import isLessThan24HoursLeft from './is-less-than-24-hours-left.js';
import type IsLessThan24HoursLeftPlugin from './is-less-than-24-hours-left.js';

dayjs.extend(toObject);
dayjs.extend(isBetween);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(minMax);
dayjs.extend(isYesterday);
dayjs.extend(isLessThan24HoursLeft);

// Keep the Dayjs plugin declaration modules reachable from the generated .d.ts.
export type DayjsPluginTypes = [
  typeof IsBetweenPlugin,
  typeof IsSameOrAfterPlugin,
  typeof IsSameOrBeforePlugin,
  typeof IsTodayPlugin,
  typeof IsTomorrowPlugin,
  typeof IsYesterdayPlugin,
  typeof IsLessThan24HoursLeftPlugin,
  typeof MinMaxPlugin,
  typeof TimezonePlugin,
  typeof ToObjectPlugin,
  typeof UtcPlugin,
];
