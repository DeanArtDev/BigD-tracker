import { type Dayjs } from '@/shared/lib/time';
import type { TimeEvent } from './time-event';
import type { DeepPartial } from '@/shared/lib/type-helpers';
import { merge } from 'lodash-es';
import { DateAndTime } from '../helpers/date-and-time';
import { EventEmitter } from '../utils/event-emitter';
import { DayViewPlugin } from './plugins';
import type {
  TimeViewDateSet,
  TimeViewEvent,
  TimeViewControllerApi,
  TimeViewEventMap,
  TimeViewControllerOptions,
  TimeViewControllerState,
  TimeViewPlugin,
  TimeViewPosition,
} from './types';

class TimeViewController<TExtra = any> {
  constructor(options?: DeepPartial<TimeViewControllerOptions>) {
    if (options != null) {
      this.#options = merge(this.#options, options);
    }

    this.#time = new DateAndTime({ locale: this.#options.locale });
    this.#plugin = new DayViewPlugin({ timeController: this.#time });
    this.#state = this.#defaultState;
  }

  #plugin!: TimeViewPlugin;
  #state!: TimeViewControllerState;
  #options: TimeViewControllerOptions = { locale: 'ru' };
  #time!: DateAndTime;
  #eventEmitter = new EventEmitter<TimeViewEventMap>({ listenersLimit: 20 });

  public getFromAndTo = (date: Dayjs): TimeViewDateSet => {
    return this.#time.getFromAndTo(date);
  };

  get state() {
    return this.#state;
  }

  public init() {
    this.#eventEmitter.emit('initiated');
  }

  public on(event: keyof TimeViewEventMap, callback: () => void): this {
    this.#eventEmitter.on(event, callback);
    return this;
  }

  public off(event: keyof TimeViewEventMap, callback: () => void): this {
    this.#eventEmitter.off(event, callback);
    return this;
  }

  public get api(): TimeViewControllerApi {
    return {
      next: () => {
        this.#state = {
          ...this.#state,
          selectedDate: this.#time.toNextDay(this.#state.selectedDate),
        };
        this.#emitUpdate();
        return this.#state.selectedDate;
      },

      prev: () => {
        this.#state = {
          ...this.#state,
          selectedDate: this.#time.toPrevDay(this.#state.selectedDate),
        };
        this.#emitUpdate();
        return this.#state.selectedDate;
      },

      today: () => {
        this.#state = {
          ...this.#state,
          selectedDate: this.#state.currentTime().startOf('day'),
        };
        this.#emitUpdate();
        return this.#state.selectedDate;
      },
    };
  }

  public destroy = (): void => {
    this.#state = this.#defaultState;
    this.#options = { locale: 'ru' };
    this.#eventEmitter.offAll();
  };

  public calculateTimeIndicator(): TimeViewPosition {
    return this.#plugin.calculateTimeIndicator();
  }

  public getEventViews(events: TimeViewEvent<TExtra>[]): TimeEvent<TExtra>[] {
    return this.#plugin.calculateEventsPositions(events, this.#state.selectedDate);
  }

  #emitUpdate() {
    this.#eventEmitter.emit('updated');
  }

  get #defaultState(): TimeViewControllerState {
    return {
      dayTimeLine: this.#plugin.shapeTimeLines(),
      selectedDate: this.#time.createDate(),
      currentTime: this.#time.createDate,
    };
  }
}

export { TimeViewController };
