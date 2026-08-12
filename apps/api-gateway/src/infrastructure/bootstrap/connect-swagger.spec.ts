import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { SwaggerAuthStrategy } from '@/infrastructure/swagger-auth/swagger-auth.strategy';
import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:net';
import * as request from 'supertest';
import { isGraphqlDocumentationRequest } from './connect-documentation';
import { connectDocumentation } from './connect-documentation';

describe('isGraphqlDocumentationRequest', () => {
  it('identifies the GraphQL landing page request', () => {
    expect(isGraphqlDocumentationRequest({ method: 'GET', query: {} })).toBe(true);
  });

  it('does not identify a GraphQL GET operation as documentation', () => {
    expect(isGraphqlDocumentationRequest({ method: 'GET', query: { query: '{ viewer { id } }' } })).toBe(false);
  });

  it('does not identify a GraphQL POST operation as documentation', () => {
    expect(isGraphqlDocumentationRequest({ method: 'POST', query: {} })).toBe(false);
  });
});

describe('connectDocumentation', () => {
  let app: INestApplication;
  let server: Server;

  beforeEach(async () => {
    const config = new Map<string, unknown>([
      ['IS_LOCAL_STAGE', false],
      ['SWAGGER_USER', 'docs-user'],
      ['SWAGGER_PASSWORD', 'docs-password'],
    ]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        SwaggerAuthStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              const value = config.get(key);
              if (value == null) throw new Error(`Missing config: ${key}`);
              return value;
            },
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    connectDocumentation(app);
    await app.listen(0, '127.0.0.1');
    server = app.getHttpServer() as Server;
  });

  afterEach(() => app.close());

  it('protects the exact /graphql landing-page path', async () => {
    const response = await request(server).get('/graphql').set('Accept', 'text/html');

    expect(response.status).toBe(401);
    expect(response.headers['www-authenticate']).toContain('Basic');
  });

  it('passes an authorized /graphql request to the next handler', async () => {
    const response = await request(server)
      .get('/graphql')
      .set('Accept', 'text/html')
      .auth('docs-user', 'docs-password');

    expect(response.status).toBe(404);
  });
});
