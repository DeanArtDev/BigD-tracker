import { SessionFactory } from '@/modules/auth/domain/aggreates';
import { DateVo, timeAndDate } from '@big-d/api-utils';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import ms from 'ms';
import { UAParser } from 'ua-parser-js';
import { SessionTokenHash } from '../../domain/value-objects';
import { AuthTransaction, SESSIONS_WRITE_REPOSITORY, SessionWriteRepository } from '../ports';
import { SessionById, SessionByUserId, sessionsCombinators } from '../specifications';

interface Fingerprint {
  readonly userAgent?: string;
}

const { and } = sessionsCombinators;

@Injectable()
class SessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @Inject(SESSIONS_WRITE_REPOSITORY) private readonly sessionWriteRepositoryKysely: SessionWriteRepository,
  ) {}

  async createHashAsync(token: string): Promise<SessionTokenHash> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(token, salt);

    return SessionTokenHash.create(hash);
  }

  async compareAsync(hash: SessionTokenHash, token: string): Promise<boolean> {
    return await bcrypt.compare(token, hash.value);
  }

  compareFingerprints(data: Fingerprint, target: Fingerprint): boolean {
    const f1 = new UAParser(data.userAgent).getResult();
    const f2 = new UAParser(target.userAgent).getResult();

    const print1 = (f1.browser.name ?? '') + (f1.os.name ?? '') + (f1.device.type ?? '');
    const print2 = (f2.browser.name ?? '') + (f2.os.name ?? '') + (f2.device.type ?? '');

    return print1 === print2;
  }

  async deleteSessionByFingerprint(input: Fingerprint & { userId: number }, trx?: AuthTransaction): Promise<void> {
    const userSessions = await this.sessionWriteRepositoryKysely.getMany(and(SessionByUserId(input.userId)), trx);

    for (const session of userSessions) {
      const isTheSame = this.compareFingerprints({ userAgent: input.userAgent }, { userAgent: session.userAgent });
      if (isTheSame) {
        await this.sessionWriteRepositoryKysely.delete(and(SessionById(session.id)), trx);
      }
    }
  }

  async createSession(input: { userId: number; ip?: string; userAgent?: string }, trx?: AuthTransaction) {
    const { ip, userAgent, userId } = input;

    const token = crypto.randomUUID();
    const tokenHash = await this.createHashAsync(token);
    const maxAge = timeAndDate()
      .add(ms(this.configService.getOrThrow('auth.REFRESH_EXPIRE_TIME')), 'milliseconds')
      .toISOString();

    const sessionDraft = SessionFactory.create({
      ip,
      userAgent,
      tokenHash,
      userId,
      expiresAt: DateVo.format(maxAge),
    });
    const session = await this.sessionWriteRepositoryKysely.create(sessionDraft, trx);

    const accessToken = await this.jwtService.signAsync({
      uid: userId,
      sid: session.id,
      expiresAt: this.configService.getOrThrow('auth.ACCESS_EXPIRE_TIME'),
    });

    return { accessToken, refreshToken: token, session, maxAge: timeAndDate(maxAge).valueOf() };
  }
}

export { SessionService };
