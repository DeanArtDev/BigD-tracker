class TaskSettingsDto {
  constructor(
    public readonly taskId: string,
    public readonly isAllDay: boolean,
    public readonly icon?: string,
  ) {}
}

export { TaskSettingsDto };
