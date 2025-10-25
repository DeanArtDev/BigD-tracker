import dayjs from 'dayjs';
import toObject from 'dayjs/plugin/toObject';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ru from 'dayjs/locale/ru'

dayjs.extend(toObject);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault('UTC');
dayjs.locale(ru)

export * from './react-integration/time-view';
