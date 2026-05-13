export class UserRegistrationCommand {
  constructor(
    readonly input: {
      readonly email: string;
      readonly password: string;
      readonly ip?: string;
      readonly userAgent?: string;
    },
  ) {}
}
