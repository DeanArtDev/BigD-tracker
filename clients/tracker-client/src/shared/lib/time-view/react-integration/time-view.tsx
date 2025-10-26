import type { TimeViewControllerOptions } from '@/shared/lib/time-view/core';
import { NavBar } from './ui/nav-bar';
import type { DeepPartial } from '@/shared/lib/type-helpers';
import type { Dayjs } from '@/shared/lib/time';
import { TimeViewControllerProvider } from './model';
import { EventList, TimeLineList } from './ui';

interface TimeViewEvent<TExtra = any> {
  readonly name: string;
  readonly to: number | Date;
  readonly from: number | Date;
  readonly extra?: TExtra;
}

/*TODO:
 *  [x] текущая дата
 *  [x] день недели
 *  [x] отображениеэвента на линии
 *  [x] линия на таймлане с текущим временем
 *  [x] даты в UTC
 *  [] метод resize
 *  [] если дата сменилась и это не сегодня, не показывать currentTime
 *  [] подключить запросы реальных данных
 *  [] добавление евента
 *  [] редактирование эвента
 *  [] удаление эвента
 *  [] визуальная группировка если больше 4 эвентов рядом
 * */

interface ComponentProps {
  readonly onDateChange?: (date: Dayjs) => void;
}

function Component<TExtra>({ onDateChange }: ComponentProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <NavBar onDateChange={onDateChange} />

      <div className="flex flex-col flex-1 min-h-0">
        <TimeLineList afterEndSlot={<EventList<TExtra> />} />
      </div>
    </div>
  );
}

interface TimeViewProps<TExtra = any> {
  readonly events: TimeViewEvent<TExtra>[];
  readonly options?: DeepPartial<TimeViewControllerOptions>;
  readonly onDateChange?: (date: Dayjs) => void;
}

function TimeView<TExtra = any>({ onDateChange, ...props }: TimeViewProps<TExtra>) {
  return (
    <TimeViewControllerProvider events={props.events} options={props.options}>
      <Component<TExtra> onDateChange={onDateChange} />
    </TimeViewControllerProvider>
  );
}

export { TimeView, type TimeViewProps };
