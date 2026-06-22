import { Session, SessionFactory } from '@/modules/auth/domain/aggreates';
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

  async compareHashAsync(hash: SessionTokenHash, token: string): Promise<boolean> {
    return await bcrypt.compare(token, hash.value);
  }

  compareFingerprints(data: Fingerprint, target: Fingerprint): boolean {
    const f1 = new UAParser(data.userAgent).getResult();
    const f2 = new UAParser(target.userAgent).getResult();

    const print1 = (f1.browser.name ?? '') + (f1.os.name ?? '') + (f1.device.type ?? '');
    const print2 = (f2.browser.name ?? '') + (f2.os.name ?? '') + (f2.device.type ?? '');

    return print1 === print2;
  }

  async deleteSessionByFingerprint(input: Fingerprint & { userId: number }, trx?: AuthTransaction): Promise<boolean> {
    const userSessions = await this.sessionWriteRepositoryKysely.getMany(and(SessionByUserId(input.userId)), trx);

    for (const session of userSessions) {
      const isTheSame = this.compareFingerprints({ userAgent: input.userAgent }, { userAgent: session.userAgent });
      if (isTheSame) {
        await this.sessionWriteRepositoryKysely.delete(and(SessionById(session.id)), trx);
        return true;
      }
    }

    return false;
  }

  async createSession(input: { userId: number; ip?: string; userAgent?: string }, trx?: AuthTransaction) {
    const { ip, userAgent, userId } = input;

    const token = crypto.randomUUID();
    const tokenHash = await this.createHashAsync(token);

    const sessionDraft = SessionFactory.create({
      ip,
      userAgent,
      tokenHash,
      userId,
      expiresAt: DateVo.format(timeAndDate().add(this.getSessionMaxAge(), 'millisecond').toISOString()),
    });
    const session = await this.sessionWriteRepositoryKysely.create(sessionDraft, trx);

    const { accessToken } = await this.createAccessToken({ userId, sessionId: session.id });

    return { accessToken, refreshToken: token, session };
  }

  async getSessionById(input: { userId: number; sessionId: number }, trx?: AuthTransaction): Promise<Session | null> {
    return await this.sessionWriteRepositoryKysely.getOne(
      and(SessionById(input.sessionId), SessionByUserId(input.userId)),
      trx,
    );
  }

  async getSessionsByUserId(input: { userId: number }, trx?: AuthTransaction): Promise<Session[]> {
    return await this.sessionWriteRepositoryKysely.getMany(and(SessionByUserId(input.userId)), trx);
  }

  async createAccessToken(input: { userId: number; sessionId: number }): Promise<{ accessToken: string }> {
    const { userId, sessionId } = input;

    const accessToken = await this.jwtService.signAsync({
      uid: userId,
      sid: sessionId,
      expiresAt: this.configService.getOrThrow('auth.ACCESS_EXPIRE_TIME'),
    });

    return { accessToken };
  }

  getSessionMaxAge(): number {
    return ms(this.configService.getOrThrow<ms.StringValue>('auth.REFRESH_EXPIRE_TIME'));
  }
}

export { SessionService };
