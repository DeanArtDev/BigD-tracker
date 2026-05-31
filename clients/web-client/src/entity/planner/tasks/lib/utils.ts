import timeAndDate, { TimeAndDateValue } from '@/shared/lib/time';

class TaskUtils {
  static formatTaskDate(value: TimeAndDateValue) {
    const date = timeAndDate(value);

    if (date.isToday()) {
      return `Сегодня, ${date.format('HH:mm')}`;
    }

    if (date.isYesterday()) {
      return `Вчера, ${date.format('HH:mm')}`;
    }

    return date.format('D MMMM, HH:mm');
  }
}

export { TaskUtils };
