export class GetTasksQuery {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly groupIds?: number[];
      readonly ids?: string[];
    },
  ) {}
}
