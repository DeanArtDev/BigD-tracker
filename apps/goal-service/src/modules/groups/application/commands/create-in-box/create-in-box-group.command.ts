export class CreateInBoxGroupCommand {
  constructor(
    readonly input: {
      readonly userId: number;
    },
  ) {}
}
