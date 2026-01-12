export class CreateGroupCommand {
  constructor(
    readonly input: {
      readonly name: string;
      readonly userId: number;
      readonly description?: string;
    },
  ) {}
}
