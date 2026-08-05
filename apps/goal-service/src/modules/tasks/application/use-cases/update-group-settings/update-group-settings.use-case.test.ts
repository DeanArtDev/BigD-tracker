import { GroupSettingsView } from '../../dto';
import { ExceptionGroupSettingsNotFound, ExceptionGroupWriteConflict } from '../../exceptions';
import { UpdateGroupSettingsCommand } from './update-group-settings.command';
import { UpdateGroupSettingsUseCase } from './update-group-settings.use-case';

describe('UpdateGroupSettingsUseCase', () => {
  const trx = { id: 333, trueTransaction: true };
  const input = { groupId: 42, userId: 5, eventColor: '#ABCDEF', textColor: undefined, isVisible: false };

  function createUseCase(params?: { currentSettings?: GroupSettingsView | null; isUpdated?: boolean }) {
    const currentSettings =
      params?.currentSettings === undefined ? GroupSettingsView.create({ groupId: 42 }) : params.currentSettings;
    const groupsReadRepo = { getSettings: jest.fn().mockResolvedValue(currentSettings) };
    const groupsWriteRepo = { updateSettings: jest.fn().mockResolvedValue(params?.isUpdated ?? true) };
    const db = { runTransaction: jest.fn().mockImplementation(async (work) => await work(trx)) };

    return {
      useCase: new UpdateGroupSettingsUseCase(groupsReadRepo as never, groupsWriteRepo as never, db as never),
      groupsReadRepo,
      groupsWriteRepo,
      db,
    };
  }

  test('merges patch with current settings and updates them in transaction', async () => {
    const { useCase, groupsReadRepo, groupsWriteRepo, db } = createUseCase();

    const result = await useCase.execute(new UpdateGroupSettingsCommand(input));

    expect(db.runTransaction).toHaveBeenCalledTimes(1);
    expect(groupsReadRepo.getSettings).toHaveBeenCalledWith({ groupId: 42, userId: 5 }, trx);
    expect(groupsWriteRepo.updateSettings).toHaveBeenCalledWith(
      { groupId: 42, patch: { eventColor: '#ABCDEF', isVisible: false } },
      trx,
    );
    expect(result).toBeInstanceOf(GroupSettingsView);
    expect(result).toMatchObject({ groupId: 42, eventColor: '#ABCDEF', isVisible: false });
  });

  test('throws when current settings do not exist', async () => {
    const { useCase, groupsWriteRepo } = createUseCase({ currentSettings: null });

    await expect(useCase.execute(new UpdateGroupSettingsCommand(input))).rejects.toBeInstanceOf(
      ExceptionGroupSettingsNotFound,
    );
    expect(groupsWriteRepo.updateSettings).not.toHaveBeenCalled();
  });

  test('throws when settings were not updated', async () => {
    const { useCase } = createUseCase({ isUpdated: false });

    await expect(useCase.execute(new UpdateGroupSettingsCommand(input))).rejects.toBeInstanceOf(
      ExceptionGroupWriteConflict,
    );
  });

  test('does not update repository when patch contains only undefined', async () => {
    const { useCase, groupsWriteRepo } = createUseCase();

    const result = await useCase.execute(
      new UpdateGroupSettingsCommand({ groupId: 42, userId: 5, eventColor: undefined }),
    );

    expect(groupsWriteRepo.updateSettings).not.toHaveBeenCalled();
    expect(result).toMatchObject(GroupSettingsView.create({ groupId: 42 }));
  });

  test('does not update repository when patch does not change settings', async () => {
    const currentSettings = GroupSettingsView.create({ groupId: 42 });
    const { useCase, groupsWriteRepo } = createUseCase({ currentSettings });

    const result = await useCase.execute(
      new UpdateGroupSettingsCommand({
        groupId: 42,
        userId: 5,
        eventColor: currentSettings.eventColor,
        isVisible: currentSettings.isVisible,
      }),
    );

    expect(groupsWriteRepo.updateSettings).not.toHaveBeenCalled();
    expect(result).toBe(currentSettings);
  });
});
