interface ExecutionContextState {
  readonly correlationId: string;
}

abstract class ExecutionContext<TDetails extends ExecutionContextState = ExecutionContextState> {
  readonly #state: TDetails;

  protected constructor(state: TDetails) {
    this.#state = state;
  }

  get correlationId(): string {
    return this.#state.correlationId;
  }

  get state(): ExecutionContextState {
    return this.#state;
  }

  public abstract fork(state: TDetails): ExecutionContext<TDetails>;
}

export { ExecutionContext, ExecutionContextState };
