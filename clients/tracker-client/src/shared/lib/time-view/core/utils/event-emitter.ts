type Listener<TParams = any> = (params: TParams) => void;

type EventMap = Record<string, any | undefined>;

class EventEmitter<TMap extends EventMap = EventMap> {
  #listenersMap = new Map<keyof TMap, Set<Listener>>();

  constructor(private readonly options?: { listenersLimit?: number }) {}

  #ensureSet<K extends keyof TMap>(event: K): Set<Listener> | undefined {
    const set = this.#listenersMap.get(event);
    if (set == null) {
      const s = new Set<Listener>();
      this.#listenersMap.set(event, s);
      return s;
    }
    return set;
  }

  public on<K extends keyof TMap>(event: K, callback: Listener<TMap[K]>): this {
    const set = this.#ensureSet(event);
    set?.add(callback);

    return this;
  }

  public emit<K extends keyof TMap>(event: K, params?: TMap[K]): { success: boolean; error?: Error } {
    const set = this.#listenersMap.get(event);
    if (set == null) {
      return { success: false, error: new Error(`There is no listener set for ${String(event)}`) };
    }

    if (this.options?.listenersLimit != null && set.size > this.options.listenersLimit) {
      return {
        success: false,
        error: new Error(`Listeners limit is above set to options event name: ${String(event)}`),
      };
    }

    set?.forEach((listener) => {
      listener(params);
    });
    return { success: true };
  }

  public offAll(): void {
    this.#listenersMap.clear();
  }

  public off<K extends keyof TMap>(event: K, callback: Listener<TMap[K]>): this {
    const set = this.#ensureSet(event);
    set?.delete(callback);
    return this;
  }

  // public once<K extends keyof T>(name: K, callback: () => void): void {}
}

export { EventEmitter, type EventMap };
