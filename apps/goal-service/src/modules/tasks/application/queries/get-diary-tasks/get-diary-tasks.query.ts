export class GetDiaryTasksQuery {
  constructor(
    readonly input: {
      readonly userId: number;

      readonly meta: {
        readonly filter: {
          readonly to: string;
          readonly from: string;
        };
      };
    },
  ) {}
}
