export class GetDetailedGroupsQuery {
  constructor(
    readonly input: {
      readonly groupId: number;
      readonly userId: number;
    },
  ) {}
}
