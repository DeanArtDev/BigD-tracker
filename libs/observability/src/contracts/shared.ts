/** Version of the JSON log schema. Increment only for breaking contract changes. */
type LogSchemaVersion = 1;

/** Severity accepted by the shared application logger. */
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** Runtime environment in which a service emitted the log. */
type Environment = 'local' | 'test' | 'dev-stage' | 'production';

export { type Environment, type LogLevel, type LogSchemaVersion };
