import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SessionTokenHash } from '../../domain/value-objects';

@Injectable()
class SessionTokenService {
  async createHashAsync(token: string): Promise<SessionTokenHash> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(token, salt);

    return SessionTokenHash.create(hash);
  }

  async compareAsync(hash: SessionTokenHash, token: string): Promise<boolean> {
    return await bcrypt.compare(token, hash.value);
  }
}

export { SessionTokenService };
