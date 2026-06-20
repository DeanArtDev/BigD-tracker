export class ReplaceGroupCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly name: string;
      readonly userId: number;
      readonly description?: string;
      readonly tasks?: {
        readonly id: string;
      }[];
    },
  ) {}
}
