export class ReferralTokenCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly sessionId: string;
    },
  ) {}
}
