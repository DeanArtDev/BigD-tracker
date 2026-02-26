export class TaskRecoveryCommand {
  constructor(
    readonly input: {
      readonly taskId: number;
      readonly userId: number;
      readonly groupId?: number;
    },
  ) {}
}
