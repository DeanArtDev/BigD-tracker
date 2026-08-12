import type {
  ContextualLogger,
  DatabaseFailureLogInput,
  LifecycleLogInput,
  ObservabilityLogger,
  OperationScope,
  StartOperationInput,
} from '../core';
import type { RequestTransportLog } from '../contracts';
import type { ObservabilityContextStorage } from './observability-context-storage';

/** Resolves the current asynchronous context before delegating each operation to the core logger. */
class CurrentContextLogger implements ContextualLogger {
  constructor(
    private readonly logger: ObservabilityLogger,
    private readonly contextStorage: ObservabilityContextStorage,
  ) {}

  startOperation<TTransport extends RequestTransportLog>(
    input: StartOperationInput<TTransport>,
  ): OperationScope<TTransport> {
    return this.getLogger().startOperation(input);
  }

  lifecycle(input: LifecycleLogInput): void {
    this.getLogger().lifecycle(input);
  }

  databaseFailure(error: unknown, input: DatabaseFailureLogInput): void {
    this.getLogger().databaseFailure(error, input);
  }

  private getLogger(): ContextualLogger {
    return this.logger.withContext(this.contextStorage.require());
  }
}

export { CurrentContextLogger };
