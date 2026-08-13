import * as express from 'express';
import type { Server } from 'node:http';
import * as request from 'supertest';
import { createRequestUrlencodedParser, parseRequestQuery, QUERY_PARSER_OPTIONS } from './init-app';

describe('request parsers', () => {
  describe('query parser', () => {
    it('parses regular nested query values', () => {
      expect(parseRequestQuery('filter[user][id]=26')).toEqual({ filter: { user: { id: '26' } } });
    });

    it('bounds the parsed query depth', () => {
      const key = Array.from({ length: QUERY_PARSER_OPTIONS.depth + 3 }, (_, index) => `[level${index}]`).join('');
      const parsed = parseRequestQuery(`root${key}=value`);

      expect(maxObjectDepth(parsed)).toBeLessThanOrEqual(QUERY_PARSER_OPTIONS.depth + 2);
    });

    it('bounds the number of parsed query parameters', () => {
      const query = Array.from({ length: QUERY_PARSER_OPTIONS.parameterLimit + 100 }, (_, index) => `p${index}=1`).join(
        '&',
      );

      expect(Object.keys(parseRequestQuery(query))).toHaveLength(QUERY_PARSER_OPTIONS.parameterLimit);
    });
  });

  describe('urlencoded body parser', () => {
    let server: Server;

    beforeAll(() => {
      const app = express();
      app.use(createRequestUrlencodedParser());
      app.post('/parse', (req, res) => res.json(req.body));
      server = app.listen(0);
    });

    afterAll(() => server.close());

    it('parses regular nested form values', async () => {
      await request(server)
        .post('/parse')
        .type('form')
        .send({ 'filter[user][id]': '26' })
        .expect(200)
        .expect({ filter: { user: { id: '26' } } });
    });

    it('rejects a form with more than the configured parameter limit', async () => {
      const body = Object.fromEntries(
        Array.from({ length: QUERY_PARSER_OPTIONS.parameterLimit + 1 }, (_, index) => [`p${index}`, '1']),
      );

      await request(server).post('/parse').type('form').send(body).expect(413);
    });
  });
});

function maxObjectDepth(value: unknown): number {
  if (value == null || typeof value !== 'object') return 0;

  return 1 + Math.max(0, ...Object.values(value).map(maxObjectDepth));
}
