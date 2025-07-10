import { UserPassword } from '../vo/user-pasword.vo';

describe('UserPassword', () => {
  it('hashes and compares password', async () => {
    const pass = await UserPassword.create('secret');
    expect(pass.value).toBeDefined();
    expect(pass.compare('secret')).toBe(true);
    expect(pass.compare('other')).toBe(false);
  });

  it('changes password', async () => {
    const pass = await UserPassword.create('secret');
    const changed = await pass.change('newpass');
    expect(changed.compare('newpass')).toBe(true);
    expect(changed.compare('secret')).toBe(false);
  });
});
