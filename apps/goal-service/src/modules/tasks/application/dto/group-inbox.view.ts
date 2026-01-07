interface GroupInboxViewState {
  readonly id: number;
  readonly userId: number;
  readonly name: string;
}

class GroupInboxView {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly name: string,
  ) {}

  static restore(input: GroupInboxViewState): GroupInboxView {
    return new GroupInboxView(input.id, input.userId, input.name);
  }
}

export { GroupInboxView, GroupInboxViewState };
