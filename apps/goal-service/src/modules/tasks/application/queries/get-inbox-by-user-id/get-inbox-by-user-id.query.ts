export class GetInboxByUserIdQuery {
  constructor(
    readonly input: {
      readonly userId: number;
    },
  ) {}
}
