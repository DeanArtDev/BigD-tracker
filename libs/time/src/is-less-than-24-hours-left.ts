import dayjs, { type PluginFunc } from 'dayjs';

declare module 'dayjs' {
  interface Dayjs {
    isLessThan24HoursLeft(): boolean;
  }
}

const isLessThan24HoursLeft: PluginFunc = (_option, DayjsClass) => {
  DayjsClass.prototype.isLessThan24HoursLeft = function isLessThan24HoursLeft(this: dayjs.Dayjs) {
    if (!this.isValid()) return false;

    const diff = this.diff(dayjs(), 'minutes', true);

    return diff > 0 && diff < 1440;
  };
};

export default isLessThan24HoursLeft;
