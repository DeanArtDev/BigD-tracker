export class GetAssignableTasksToGroupQuery {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly groupId: number;
      readonly search: string;
    },
  ) {}
}
