export class DeleteGroupCommand {
  constructor(
    readonly input: {
      readonly groupId: number;
      readonly userId: number;
    },
  ) {}
}
