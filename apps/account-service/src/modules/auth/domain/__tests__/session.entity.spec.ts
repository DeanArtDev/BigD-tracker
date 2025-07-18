import { subMinutes } from 'date-fns';
import { SessionEntity } from '../session.entity';

describe('SessionEntity', () => {
  it('creates session and sets expiration date', () => {
    const session = SessionEntity.create({ uuid: '1', userId: 1 });
    const date = new Date(Date.now() + 1000);
    session.setExpirationDate(date);
    expect(session.expiresAt).toBe(date.toISOString());
    expect(session.isExpired).toBe(false);
  });

  it('session expired correctly', () => {
    const session = SessionEntity.restore({
      uuid: '1',
      userId: 1,
      expiresAt: subMinutes(new Date(), 1).toISOString(),
      revoked: false,
      token: '',
    });
    expect(session.isExpired).toBe(true);
  });
});
