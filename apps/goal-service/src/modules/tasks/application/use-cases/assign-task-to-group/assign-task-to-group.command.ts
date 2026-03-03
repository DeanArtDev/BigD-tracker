export class AssignTaskToGroupCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly taskId: string;
      readonly groupId: number;
    },
  ) {}
}
