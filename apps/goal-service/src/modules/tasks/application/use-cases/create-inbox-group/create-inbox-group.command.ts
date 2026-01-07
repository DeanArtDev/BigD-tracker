export class CreateInboxGroupCommand {
  constructor(
    readonly input: {
      readonly userId: number;
    },
  ) {}
}
