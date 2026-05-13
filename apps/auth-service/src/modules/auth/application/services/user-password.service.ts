import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserPasswordHash } from '../../domain/value-objects';

@Injectable()
class UserPasswordService {
  async createHashAsync(userPassword: string): Promise<UserPasswordHash> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(userPassword, salt);

    return UserPasswordHash.create(hash);
  }

  async compareAsync(hash: UserPasswordHash, password: string): Promise<boolean> {
    return await bcrypt.compare(password, hash.value);
  }
}

export { UserPasswordService };
