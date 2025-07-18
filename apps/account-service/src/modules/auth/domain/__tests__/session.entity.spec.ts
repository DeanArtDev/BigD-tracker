import { DateVo } from '@big-d/api-utils';
import { subMinutes } from 'date-fns';
import { SessionEntity } from '../session.entity';

describe('SessionEntity', () => {
  it('creates session and sets expiration date', () => {
    const date = new Date(Date.now() + 1000).toISOString();
    const session = SessionEntity.create({
      uuid: '1',
      userId: 1,
      expiresAt: DateVo.create(date),
    });
    expect(session.expiresAt).toBe(date);
    expect(session.isExpired).toBe(false);
  });

  it('session expired correctly', () => {
    const session = SessionEntity.restore({
      uuid: '1',
      userId: 1,
      expiresAt: DateVo.create(subMinutes(new Date(), 1).toISOString()),
      revoked: false,
      token: '',
    });
    expect(session.isExpired).toBe(true);
  });
});
