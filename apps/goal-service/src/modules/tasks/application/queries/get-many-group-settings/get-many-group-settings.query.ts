class GetManyGroupSettingsQuery {
  constructor(
    readonly input: {
      readonly groupIds: number[];
      readonly userId: number;
    },
  ) {}
}

export { GetManyGroupSettingsQuery };
