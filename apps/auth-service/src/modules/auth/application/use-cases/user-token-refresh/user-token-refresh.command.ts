export class UserTokenRefreshCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly sessionId: number;
      readonly refreshToken: string;
      readonly userAgent?: string;
      readonly ip?: string;
    },
  ) {}
}
