import { timeAndDate, TimeAndTime, TimeAndTimeValue } from './init';

function applyTimeParts(date: TimeAndTimeValue, patch: TimeAndTimeValue): TimeAndTime {
  const target = timeAndDate(date);
  const source = timeAndDate(patch);

  return target
    .hour(source.hour())
    .minute(source.minute())
    .second(source.second())
    .millisecond(source.millisecond());
}

export { applyTimeParts };
