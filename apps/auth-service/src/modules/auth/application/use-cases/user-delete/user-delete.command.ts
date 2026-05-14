export class UserDeleteCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly userAgent?: string;
      readonly ip?: string;
    },
  ) {}
}
