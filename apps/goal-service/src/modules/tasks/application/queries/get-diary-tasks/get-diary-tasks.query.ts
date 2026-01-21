export class GetDiaryTasksQuery {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly from: string;
      readonly to: string;
    },
  ) {}
}
