export class ReplaceGroupCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly name: string;
      readonly userId: number;
      readonly description: string | undefined | null;
      readonly tasks?: {
        readonly id: string;
      }[];
    },
  ) {}
}
