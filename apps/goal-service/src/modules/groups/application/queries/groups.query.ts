export class GetGroupByIdQuery {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
    },
  ) {}
}

export class GetGroupUserInboxQuery {
  constructor(
    readonly input: {
      readonly userId: number;
    },
  ) {}
}

export class GetGroupByGoalIdQuery {
  constructor(
    readonly input: {
      readonly goalId: number;
      readonly userId: number;
    },
  ) {}
}
