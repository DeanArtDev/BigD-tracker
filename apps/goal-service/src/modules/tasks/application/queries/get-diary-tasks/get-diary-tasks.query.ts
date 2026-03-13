export class GetDiaryTasksQuery {
  constructor(
    readonly input: {
      readonly userId: number;

      readonly meta: {
        readonly filter: {
          readonly group?: number[];
          readonly to: string;
          readonly from: string;
        };
      };
    },
  ) {}
}
