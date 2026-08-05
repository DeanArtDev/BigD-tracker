class GetTaskSettingsQuery {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly taskIds: string[];
    },
  ) {}
}

export { GetTaskSettingsQuery };
