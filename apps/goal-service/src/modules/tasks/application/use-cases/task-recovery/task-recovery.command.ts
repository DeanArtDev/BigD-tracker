export class TaskRecoveryCommand {
  constructor(
    readonly input: {
      readonly taskId: string;
      readonly userId: number;
      readonly groupId?: number;
    },
  ) {}
}
