import { SessionEntity } from '@/modules/auth/domain';
import { DateVo } from '@big-d/api-utils';

describe('SessionEntity', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-12T13:50:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('creates session and sets expiration date', () => {
    const session = SessionEntity.create({
      uuid: '1',
      userId: 1,
      expiresAt: DateVo.create('2026-03-13T13:50'),
    });

    expect(session.expiresAt).toBe('2026-03-13T13:50');
    expect(session.isExpired).toBe(false);
  });

  it('session expired correctly', () => {
    const session = SessionEntity.restore({
      uuid: '1',
      userId: 1,
      expiresAt: DateVo.create('2026-03-12T13:49'),
      revoked: false,
      token: '',
    });

    expect(session.isExpired).toBe(true);
  });
});
