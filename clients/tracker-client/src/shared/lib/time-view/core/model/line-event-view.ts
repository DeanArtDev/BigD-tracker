import { LineEvent, type LineEventData } from './line-event';

interface LineEventViewData extends LineEventData {
  readonly style: {
    readonly width: number | string;
    readonly height: number | string;
    readonly zIndex?: number
  };
}

class LineEventView<TExtra = any> extends LineEvent {
  #style: LineEventViewData['style'];

  constructor({ style, ...liveEventData }: LineEventViewData, extra?: TExtra) {
    super(liveEventData, extra);
    this.#style = style;
  }

  get style() {
    return this.#style;
  }

  setStyle(style: Partial<LineEventViewData['style']>) {
    this.#style = {...this.#style, ...style};
  }
}

export { LineEventView, type LineEventViewData };
