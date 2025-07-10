export class GetGoalByIdQuery {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
    },
  ) {}
}

export class GetAllGoalsByUserIdQuery {
  constructor(
    readonly input: {
      readonly userId: number;
    },
  ) {}
}
