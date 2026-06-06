interface GroupInboxViewState {
  readonly id: number;
  readonly userId: number;
  readonly name: string;
  readonly taskCount: number;
}

class GroupInboxView {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly name: string,
    public readonly taskCount: number,
  ) {}

  static restore(input: GroupInboxViewState): GroupInboxView {
    return new GroupInboxView(input.id, input.userId, input.name, input.taskCount);
  }
}

export { GroupInboxView, GroupInboxViewState };
