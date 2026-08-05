import { DEFAULT_GROUP_SETTINGS } from '@/modules/tasks/domain/constants';

interface GroupSettingsViewState {
  readonly groupId: number;
  readonly eventColor: string;
  readonly eventSelectedColor: string;
  readonly lineColor: string;
  readonly textColor: string;
  readonly eventColorDark: string;
  readonly eventSelectedColorDark: string;
  readonly lineColorDark: string;
  readonly textColorDark: string;
  readonly isDefault: boolean;
  readonly isVisible: boolean;
  readonly isReadonly: boolean;
}

type GroupSettingsViewPatch = Partial<Omit<GroupSettingsViewState, 'groupId'>>;

class GroupSettingsView {
  constructor(
    public readonly groupId: number,
    public readonly eventColor: string,
    public readonly eventSelectedColor: string,
    public readonly lineColor: string,
    public readonly textColor: string,
    public readonly eventColorDark: string,
    public readonly eventSelectedColorDark: string,
    public readonly lineColorDark: string,
    public readonly textColorDark: string,
    public readonly isDefault: boolean,
    public readonly isVisible: boolean,
    public readonly isReadonly: boolean,
  ) {}

  static create(input: { groupId: number }): GroupSettingsView {
    return GroupSettingsView.restore({ groupId: input.groupId, ...DEFAULT_GROUP_SETTINGS });
  }

  static restore(input: GroupSettingsViewState): GroupSettingsView {
    return new GroupSettingsView(
      input.groupId,
      input.eventColor,
      input.eventSelectedColor,
      input.lineColor,
      input.textColor,
      input.eventColorDark,
      input.eventSelectedColorDark,
      input.lineColorDark,
      input.textColorDark,
      input.isDefault,
      input.isVisible,
      input.isReadonly,
    );
  }

  isEqual(other: GroupSettingsView): boolean {
    return (
      this.groupId === other.groupId &&
      this.eventColor === other.eventColor &&
      this.eventSelectedColor === other.eventSelectedColor &&
      this.lineColor === other.lineColor &&
      this.textColor === other.textColor &&
      this.eventColorDark === other.eventColorDark &&
      this.eventSelectedColorDark === other.eventSelectedColorDark &&
      this.lineColorDark === other.lineColorDark &&
      this.textColorDark === other.textColorDark &&
      this.isDefault === other.isDefault &&
      this.isVisible === other.isVisible &&
      this.isReadonly === other.isReadonly
    );
  }
}

export { GroupSettingsView, GroupSettingsViewPatch, GroupSettingsViewState };
