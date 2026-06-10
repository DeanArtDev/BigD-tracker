import { initTestEnvironment } from '@/../jest.setup';
import { CursorPaginationService } from '../cursor-pagination.service';

initTestEnvironment();

describe('CursorPaginationService', () => {
  const service = new CursorPaginationService();

  test('should build next cursor when no cursor provided', () => {
    const result = service.getNextCursor({
      lastId: 12,
      search: 'Group',
      sort: ['name'],
      filter: { priority: [1] },
      limit: 10,
      currentPartLength: 11,
    });

    expect(result.nextCursor).toEqual(expect.any(String));
    const decoded = service.decodeCursorString(result.nextCursor);
    expect(decoded).toEqual({
      lastId: 12,
      search: 'Group',
      sort: ['name'],
      filter: { priority: [1] },
    });
  });

  test('should NOT build next cursor when gave last part', () => {
    const result = service.getNextCursor({
      lastId: 12,
      search: 'Group',
      sort: ['name'],
      filter: { priority: [1] },
      limit: 10,
      currentPartLength: 9,
    });

    expect(result.nextCursor).toEqual(undefined);
  });

  test('should return undefined next cursor when last part', () => {
    const result = service.getNextCursor({
      lastId: 20,
      search: 'Group',
      sort: ['name'],
      filter: { priority: [1] },
      limit: 10,
      currentPartLength: 2,
    });

    expect(result).toEqual({ nextCursor: undefined, hasNext: false });
  });

  test('should return next cursor when cursor provided and page full', () => {
    const result = service.getNextCursor({
      lastId: 30,
      search: 'Group',
      sort: ['name'],
      filter: { priority: [1] },
      limit: 2,
      currentPartLength: 2,
    });

    expect(result.nextCursor).toEqual(expect.any(String));
    const decoded = service.decodeCursorString(result.nextCursor);
    expect(decoded).toEqual({
      lastId: 30,
      search: 'Group',
      sort: ['name'],
      filter: { priority: [1] },
    });
  });

  test('should return undefined next cursor when lastId missing', () => {
    const result = service.getNextCursor({
      lastId: undefined,
      search: 'Group',
      sort: ['name'],
      filter: { priority: [1] },
      limit: 2,
      currentPartLength: 2,
    });

    expect(result).toEqual({ nextCursor: undefined, hasNext: false });
  });

  test('should return undefined when cursor is invalid', () => {
    const decoded = service.decodeCursorString('not-a-base64');
    expect(decoded).toBeUndefined();
  });

  test('should return undefined when cursor schema invalid', () => {
    const cursor = Buffer.from(JSON.stringify({ lastId: false }), 'utf8').toString('base64');
    const decoded = service.decodeCursorString(cursor);
    expect(decoded).toBeUndefined();
  });
});
