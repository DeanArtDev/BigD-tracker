import { createDate } from './date-and-time';
import { Dayjs } from 'dayjs';

function getDayTimeLine(): Dayjs[] {
  let buffer: Dayjs[] = [];

  buffer = new Array(24).fill(0).map((_, index) => {
    return createDate().startOf('date').add(index, 'hour');
  });

  buffer.push(createDate().startOf('date').add(1, 'day'));

  return buffer;
}

export { getDayTimeLine };
