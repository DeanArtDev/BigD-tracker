export class UpdateGroupCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
      readonly name: string;
      readonly position: number;
      readonly description?: string;
    },
  ) {}
}
