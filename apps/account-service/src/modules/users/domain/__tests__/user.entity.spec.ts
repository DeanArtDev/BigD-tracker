import { Email } from '@big-d/api-utils';
import { UserPassword } from '../vo/user-pasword.vo';
import { UserEntity } from '../user.entity';

describe('UserEntity', () => {
  it('creates user and validates password', async () => {
    const email = Email.create('test@example.com');
    const password = await UserPassword.create('secret');
    const user = UserEntity.create({ email, passwordHash: password });
    expect(user.id).toBeGreaterThan(0);
    expect(user.email).toBe('test@example.com');
    expect(user.validatePassword('secret')).toBe(true);
    expect(user.validatePassword('wrong')).toBe(false);
  });
});
