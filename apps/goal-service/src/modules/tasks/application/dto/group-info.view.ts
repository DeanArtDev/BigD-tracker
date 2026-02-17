interface GroupInfoViewState {
  readonly id: number;
  readonly name: string;
}

class GroupInfoView {
  constructor(
    public readonly id: number,
    public readonly name: string,
  ) {}

  static restore(input: GroupInfoViewState): GroupInfoView {
    return new GroupInfoView(input.id, input.name);
  }
}

export { GroupInfoView, GroupInfoViewState };
