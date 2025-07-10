export class CreateGroupCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly name: string;
      readonly goalId: number;
      readonly position: number;
      readonly description?: string;
    },
  ) {}
}
