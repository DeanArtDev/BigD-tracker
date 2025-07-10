export class DeleteGroupCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
    },
  ) {}
}
