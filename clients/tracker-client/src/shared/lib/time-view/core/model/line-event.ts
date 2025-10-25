interface LineEventData {
  readonly name: string;
  readonly to: number | Date;
  readonly from: number | Date;
  readonly position: { x: number | string; y: number | string };
}

class LineEvent<TExtra = any> {
  #data: LineEventData;
  #extra?: TExtra;

  constructor(data: LineEventData, extra?: TExtra) {
    this.#data = data;
    this.#extra = extra;
  }

  public setPosition(position: Partial<LineEventData['position']>) {
    this.#data = { ...this.#data, position: { ...this.#data.position, ...position } };
  }

  get name() {
    return this.#data.name;
  }
  get to() {
    return this.#data.to;
  }
  get from() {
    return this.#data.from;
  }
  get position() {
    return this.#data.position;
  }
  get extra() {
    return this.#extra;
  }
}

export { LineEvent, type LineEventData };
