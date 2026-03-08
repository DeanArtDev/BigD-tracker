import dayjs, { ConfigType, Dayjs } from 'dayjs';
import toObject from 'dayjs/plugin/toObject';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(toObject);
dayjs.extend(isBetween);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(minMax);

type TimeAndDateValue = ConfigType;
type TimeAndDate = Dayjs;

export const timeAndDate = dayjs;
export { TimeAndDateValue, TimeAndDate };
