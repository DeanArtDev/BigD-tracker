export class GetThingByIdQuery {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
    },
  ) {}
}

export class GetThingsByGroupIdQuery {
  constructor(
    readonly input: {
      readonly groupId: number;
      readonly userId: number;
    },
  ) {}
}

export class GetTodaysThingsQuery {
  constructor(
    readonly input: {
      readonly userId: number;
    },
  ) {}
}

export class GetRepeatableThingsQuery {
  constructor(
    readonly input: {
      readonly userId: number;
    },
  ) {}
}
