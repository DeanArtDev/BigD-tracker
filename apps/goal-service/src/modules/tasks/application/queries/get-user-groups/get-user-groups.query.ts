export class GetUserGroupsQuery {
  constructor(
    readonly input: {
      readonly userId: number;
    },
    readonly meta: {
      readonly lastId?: number;
      readonly limit: number;
      readonly search?: string;
      readonly sort?: string[];
      readonly filter?: string[];
    },
  ) {}
}
