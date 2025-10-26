interface TimeViewControllerEventMap {
  readonly initiated: undefined;
  readonly updated: undefined;
}

interface TimeLineEvent<TExtra = any> {
  readonly name: string;
  readonly to: number | Date;
  readonly from: number | Date;
  readonly extra?: TExtra;
}

interface TimeViewControllerOptions {
  readonly locale?: string;
  readonly view: {
    readonly lineCount: number;
    readonly timeColumnOffset: number;
  };
}

export type { TimeViewControllerEventMap, TimeLineEvent, TimeViewControllerOptions };
