export class ReplaceGroupCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly name: string;
      readonly userId: number;
      readonly description?: string;
      readonly tasks: {
        readonly id: number;
        readonly name: string;
        readonly description?: string;
        readonly weight: number;
        readonly priority: number;
        readonly startDate?: string;
        readonly deadline?: string;
      }[];
    },
  ) {}
}
