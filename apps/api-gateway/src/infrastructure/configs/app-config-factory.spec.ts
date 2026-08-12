import { envSchema } from './app-config-factory';

const validEnvironment = {
  API_PORT: '4022',
  TZ: 'UTC',
  NODE_ENV: 'development',
  APP_VERSION: 'test',
  RMQ_USER: 'guest',
  RMQ_PASSWORD: 'guest',
  RMQ_PORT: '5672',
  RMQ_HOST: 'localhost',
  ORIGIN: 'http://localhost:3000',
  LOG_PRETTY: '1',
};

describe('envSchema documentation credentials', () => {
  it('not allows missing credentials in local environment', () => {
    expect(envSchema.safeParse({ ...validEnvironment, APP_ENV: 'local' }).success).toBe(false);
  });

  it.each(['test', 'dev-stage', 'production'] as const)('requires credentials in %s environment', (APP_ENV) => {
    const result = envSchema.safeParse({ ...validEnvironment, APP_ENV });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map(({ path }) => path)).toEqual(
        expect.arrayContaining([['SWAGGER_USER'], ['SWAGGER_PASSWORD']]),
      );
    }
  });

  it.each(['test', 'dev-stage', 'production'] as const)('accepts credentials in %s environment', (APP_ENV) => {
    expect(
      envSchema.safeParse({
        ...validEnvironment,
        APP_ENV,
        SWAGGER_USER: 'docs',
        SWAGGER_PASSWORD: 'secretsecret',
      }).success,
    ).toBe(true);
  });
});
