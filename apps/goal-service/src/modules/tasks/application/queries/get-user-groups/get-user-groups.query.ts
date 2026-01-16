export class GetUserGroupsQuery {
  constructor(
    readonly input: {
      readonly userId: number;
    },
  ) {}
}
