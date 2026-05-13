export class UserLogoutCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly ip?: string;
      readonly userAgent?: string;
    },
  ) {}
}
