export class DeleteThingCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
    },
  ) {}
}

export class DeleteThingByGroupIdCommand {
  constructor(
    readonly input: {
      readonly groupId: number;
      readonly userId: number;
    },
  ) {}
}
