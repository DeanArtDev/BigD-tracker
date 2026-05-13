export class GetMeQuery {
  constructor(
    readonly input: {
      readonly userId: number;
    },
  ) {}
}
