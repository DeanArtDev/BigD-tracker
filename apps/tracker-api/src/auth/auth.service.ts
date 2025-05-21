import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/users.entity';
import { ExceptionWrongLoginOrPassword } from '@big-d/api-exception';
import { JwtService } from '@nestjs/jwt';
import { RegisterRequest } from './dto/register.dto';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly authRepository: AuthRepository,
  ) {}

  async register(
    data: RegisterRequest & { ip: string; userAgent: string },
  ): Promise<{ sessionToken: string; accessToken: string }> {
    const newUser = await this.userService.createUser({
      email: data.login,
      password: data.password,
    });

    const { session, accessToken } = await this.createSession({
      ip: data.ip,
      userId: newUser.id,
      userAgent: data.userAgent,
    });

    return {
      accessToken,
      sessionToken: session.token,
    };
  }

  async checkUserAuth(data: { email: string; password: string }): Promise<User> {
    const user = await this.userService.checkUserByPassword({
      email: data.email,
      password: data.password,
    });

    if (user == null) {
      throw new ExceptionWrongLoginOrPassword({ message: 'Invalid credentials' });
    }
    return user;
  }

  async logout(data: { userId: number; sessionUuid: string }): Promise<boolean> {
    if (!(await this.userService.findUser({ id: data.userId }))) {
      throw new UnauthorizedException('Session owner is not existed');
    }

    return await this.authRepository.deleteSession({
      uuid: data.sessionUuid,
      userId: data.userId,
    });
  }

  async refreshToken(data: {
    sessionToken: string;
    userAgent?: string;
    ip?: string;
  }): Promise<{ sessionToken: string; accessToken: string }> {
    const userSession = await this.authRepository.findSessionByToken(data.sessionToken);
    if (userSession == null || new Date() > userSession.expires_at) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    if (!(await this.userService.findUser({ id: userSession.users_id }))) {
      throw new UnauthorizedException('Session owner is not existed');
    }

    await this.authRepository.deleteSession({
      token: userSession.token,
      userId: userSession.users_id,
    });

    const { session, accessToken } = await this.createSession({
      userId: userSession.users_id,
      userAgent: data.userAgent,
      ip: data.ip,
    });

    return {
      accessToken,
      sessionToken: session.token,
    };
  }

  async createSession(data: { ip?: string; userId: number; userAgent?: string }) {
    const { session } = await this.authRepository.createSession(data);

    if (session == null) {
      const { ip, userId, userAgent } = data;
      throw new InternalServerErrorException(
        { ip, userId, userAgent },
        { cause: 'Failed to create session' },
      );
    }

    const accessToken = await this.jwtService.signAsync({
      uid: data.userId,
      sid: session.uuid,
    });

    return { session, accessToken };
  }
}
