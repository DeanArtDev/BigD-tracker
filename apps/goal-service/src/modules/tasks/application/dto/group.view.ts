import { GroupStatus } from '@big-d/api-contracts';

interface GroupViewState {
  readonly id: number;
  readonly userId: number;
  readonly progress: number;
  readonly name: string;
  readonly status: GroupStatus;
  readonly description?: string;
}

class GroupView {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly progress: number,
    public readonly name: string,
    public readonly status: GroupStatus,
    public readonly description?: string,
  ) {}

  static restore(input: GroupViewState): GroupView {
    return new GroupView(
      input.id,
      input.userId,
      input.progress,
      input.name,
      input.status,
      input.description,
    );
  }
}

export { GroupView, GroupViewState };
