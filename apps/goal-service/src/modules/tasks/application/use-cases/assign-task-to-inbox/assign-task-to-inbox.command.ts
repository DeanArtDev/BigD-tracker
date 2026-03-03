export class AssignTaskToInboxCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly taskId: string;
    },
  ) {}
}
