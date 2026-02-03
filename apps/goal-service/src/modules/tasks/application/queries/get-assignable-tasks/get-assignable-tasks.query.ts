export class GetAssignableTasksQuery {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly search: string;
    },
  ) {}
}
