export class GetTaskByIdQuery {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly taskId: string;
    },
  ) {}
}
