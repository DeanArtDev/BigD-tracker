import { Test } from '@nestjs/testing';

jest.mock('../src/modules/auth/application/use-cases', () => {
  class LoginUseCase {
    execute = jest.fn();
  }
  class LogoutUseCase {
    execute = jest.fn();
  }
  class RefreshUseCase {
    execute = jest.fn();
  }
  class RegisterUseCase {
    execute = jest.fn();
  }
  return { LoginUseCase, LogoutUseCase, RefreshUseCase, RegisterUseCase };
});
import {
  AccountLogin,
  AccountLogout,
  AccountRefresh,
  AccountRegister,
  RpcStatus,
} from '@big-d/api-contracts';
import { AuthController } from '../src/modules/auth/application/auth.controller';
import {
  LoginUseCase,
  LogoutUseCase,
  RefreshUseCase,
  RegisterUseCase,
} from '../src/modules/auth/application/use-cases';

describe('AuthController (e2e)', () => {
  let controller: AuthController;

  const loginUseCase = { execute: jest.fn() } as const;
  const logoutUseCase = { execute: jest.fn() } as const;
  const registerUseCase = { execute: jest.fn() } as const;
  const refreshUseCase = { execute: jest.fn() } as const;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LoginUseCase, useValue: loginUseCase },
        { provide: LogoutUseCase, useValue: logoutUseCase },
        { provide: RegisterUseCase, useValue: registerUseCase },
        { provide: RefreshUseCase, useValue: refreshUseCase },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);

    jest.clearAllMocks();
  });

  it('register should delegate to use case and return tokens', async () => {
    registerUseCase.execute.mockResolvedValue({
      sessionToken: 'r-token',
      accessToken: 'a-token',
    });

    const req: AccountRegister.Request = {
      data: {
        login: 'user@test.com',
        password: 'password',
        ip: '127.0.0.1',
        userAgent: 'jest',
      },
    } as any;

    const res = await controller.register(req);

    expect(registerUseCase.execute).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'password',
      ip: '127.0.0.1',
      userAgent: 'jest',
    });
    expect(res).toEqual({
      data: { refreshToken: 'r-token', accessToken: 'a-token' },
    });
  });

  it('refresh should delegate to use case and return new tokens', async () => {
    refreshUseCase.execute.mockResolvedValue({
      sessionToken: 'new-r',
      accessToken: 'new-a',
    });

    const req: AccountRefresh.Request = {
      data: { refreshToken: 'old-r', ip: '1.1.1.1', userAgent: 'jest' },
    } as any;

    const res = await controller.refreshToken(req);

    expect(refreshUseCase.execute).toHaveBeenCalledWith({
      sessionToken: 'old-r',
      ip: '1.1.1.1',
      userAgent: 'jest',
    });
    expect(res).toEqual({
      data: { refreshToken: 'new-r', accessToken: 'new-a' },
    });
  });

  it('login should delegate to use case and return tokens', async () => {
    loginUseCase.execute.mockResolvedValue({
      sessionToken: 'r',
      accessToken: 'a',
    });

    const req: AccountLogin.Request = {
      data: {
        login: 'user@test.com',
        password: 'pass',
        ip: '0.0.0.0',
        userAgent: 'jest',
      },
    } as any;

    const res = await controller.login(req);

    expect(loginUseCase.execute).toHaveBeenCalledWith({
      login: 'user@test.com',
      password: 'pass',
      ip: '0.0.0.0',
      userAgent: 'jest',
    });
    expect(res).toEqual({ data: { refreshToken: 'r', accessToken: 'a' } });
  });

  it('logout should delegate to use case and return success status', async () => {
    logoutUseCase.execute.mockResolvedValue(undefined);

    const req: AccountLogout.Request = {
      data: { userId: 1, userAgent: 'jest' },
    } as any;

    const res = await controller.logout(req);

    expect(logoutUseCase.execute).toHaveBeenCalledWith({
      userId: 1,
      userAgent: 'jest',
    });
    expect(res).toEqual({ data: { stats: RpcStatus.SUCCESS } });
  });
});
