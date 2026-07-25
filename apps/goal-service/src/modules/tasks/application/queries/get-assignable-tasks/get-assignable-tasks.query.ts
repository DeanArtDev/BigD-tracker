export class GetAssignableTasksQuery {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly groupIds?: number[];
      readonly search: string;
    },
  ) {}
}
