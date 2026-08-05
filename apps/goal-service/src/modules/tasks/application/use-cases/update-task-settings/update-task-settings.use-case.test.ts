import { TaskRecurrenceOverrideSettingsView, TaskSettingsView } from '../../dto';
import {
  ExceptionTaskRecurrenceOverrideSettingsNotFound,
  ExceptionTaskSettingsNotFound,
  ExceptionTaskUnprocessable,
  ExceptionTaskWriteConflict,
} from '../../exceptions';
import { UpdateTaskSettingsCommand } from './update-task-settings.command';
import { UpdateTaskSettingsUseCase } from './update-task-settings.use-case';

describe('UpdateTaskSettingsUseCase', () => {
  const trx = { id: 333, trueTransaction: true };
  const input = { taskId: 'o::42', userId: 5, icon: null, isAllDay: true };

  function createUseCase(params?: {
    currentSettings?: TaskSettingsView | null;
    currentOverrideSettings?: TaskRecurrenceOverrideSettingsView | null;
    isUpdated?: boolean;
  }) {
    const currentSettings =
      params?.currentSettings === undefined
        ? TaskSettingsView.restore({ taskId: 42, icon: 'folder', isAllDay: false })
        : params.currentSettings;
    const taskTypeService = {
      getType: jest.fn().mockReturnValue({
        isOrigin: true,
        isVirtual: false,
        isOverride: false,
        data: { id: 42 },
      }),
    };
    const tasksReadRepo = { getSettings: jest.fn().mockResolvedValue(currentSettings) };
    const tasksWriteRepo = { updateSettings: jest.fn().mockResolvedValue(params?.isUpdated ?? true) };
    const currentOverrideSettings =
      params?.currentOverrideSettings === undefined
        ? TaskRecurrenceOverrideSettingsView.restore({
            taskRecurrenceOverrideId: 15,
            icon: 'folder',
            isAllDay: false,
          })
        : params.currentOverrideSettings;
    const tasksOverridesWriteRepo = {
      getSettings: jest.fn().mockResolvedValue(currentOverrideSettings),
      updateSettings: jest.fn().mockResolvedValue(params?.isUpdated ?? true),
    };
    const db = { runTransaction: jest.fn().mockImplementation(async (work) => await work(trx)) };

    return {
      useCase: new UpdateTaskSettingsUseCase(
        taskTypeService,
        tasksReadRepo as never,
        tasksWriteRepo as never,
        tasksOverridesWriteRepo as never,
        db as never,
      ),
      taskTypeService,
      tasksReadRepo,
      tasksWriteRepo,
      tasksOverridesWriteRepo,
      db,
    };
  }

  test('merges patch with current settings and updates them in transaction', async () => {
    const { useCase, taskTypeService, tasksReadRepo, tasksWriteRepo, db } = createUseCase();

    const result = await useCase.execute(new UpdateTaskSettingsCommand(input));

    expect(db.runTransaction).toHaveBeenCalledTimes(1);
    expect(taskTypeService.getType).toHaveBeenCalledWith({ taskId: 'o::42' });
    expect(tasksReadRepo.getSettings).toHaveBeenCalledWith({ taskId: 42, userId: 5 }, trx);
    expect(tasksWriteRepo.updateSettings).toHaveBeenCalledWith(
      { taskId: 42, patch: { icon: null, isAllDay: true } },
      trx,
    );
    expect(result).toBeInstanceOf(TaskSettingsView);
    expect(result).toMatchObject({ taskId: 42, icon: undefined, isAllDay: true });
  });

  test('throws when current settings do not exist', async () => {
    const { useCase, tasksWriteRepo } = createUseCase({ currentSettings: null });

    await expect(useCase.execute(new UpdateTaskSettingsCommand(input))).rejects.toBeInstanceOf(
      ExceptionTaskSettingsNotFound,
    );
    expect(tasksWriteRepo.updateSettings).not.toHaveBeenCalled();
  });

  test('updates recurrence override settings', async () => {
    const { useCase, taskTypeService, tasksReadRepo, tasksOverridesWriteRepo } = createUseCase();
    taskTypeService.getType.mockReturnValue({
      isOrigin: false,
      isVirtual: false,
      isOverride: true,
      data: { recurrenceId: 7, overrideId: 15, date: '2026-08-05T10:00:00.000Z' },
    });

    const result = await useCase.execute(
      new UpdateTaskSettingsCommand({
        taskId: 'ov::7::2026-08-05T10:00:00.000Z::15',
        userId: 5,
        icon: null,
        isAllDay: true,
      }),
    );

    expect(tasksReadRepo.getSettings).not.toHaveBeenCalled();
    expect(tasksOverridesWriteRepo.getSettings).toHaveBeenCalledWith({ overrideId: 15, userId: 5 }, trx);
    expect(tasksOverridesWriteRepo.updateSettings).toHaveBeenCalledWith(
      { overrideId: 15, patch: { icon: null, isAllDay: true } },
      trx,
    );
    expect(result).toBeInstanceOf(TaskRecurrenceOverrideSettingsView);
    expect(result).toMatchObject({ taskRecurrenceOverrideId: 15, icon: undefined, isAllDay: true });
  });

  test('throws when recurrence override settings do not exist', async () => {
    const { useCase, taskTypeService, tasksOverridesWriteRepo } = createUseCase({
      currentOverrideSettings: null,
    });
    taskTypeService.getType.mockReturnValue({
      isOrigin: false,
      isVirtual: false,
      isOverride: true,
      data: { recurrenceId: 7, overrideId: 15, date: '2026-08-05T10:00:00.000Z' },
    });

    await expect(
      useCase.execute(
        new UpdateTaskSettingsCommand({
          taskId: 'ov::7::2026-08-05T10:00:00.000Z::15',
          userId: 5,
          icon: 'folder',
        }),
      ),
    ).rejects.toBeInstanceOf(ExceptionTaskRecurrenceOverrideSettingsNotFound);
    expect(tasksOverridesWriteRepo.updateSettings).not.toHaveBeenCalled();
  });

  test('throws when task id belongs to virtual task', async () => {
    const { useCase, taskTypeService, tasksReadRepo } = createUseCase();
    taskTypeService.getType.mockReturnValue({
      isOrigin: false,
      isVirtual: true,
      isOverride: false,
      data: { recurrenceId: 7, date: '2026-08-05T10:00:00.000Z' },
    });

    await expect(useCase.execute(new UpdateTaskSettingsCommand(input))).rejects.toBeInstanceOf(
      ExceptionTaskUnprocessable,
    );
    expect(tasksReadRepo.getSettings).not.toHaveBeenCalled();
  });

  test('throws when settings were not updated', async () => {
    const { useCase } = createUseCase({ isUpdated: false });

    await expect(useCase.execute(new UpdateTaskSettingsCommand(input))).rejects.toBeInstanceOf(
      ExceptionTaskWriteConflict,
    );
  });

  test('does not update repository when patch contains only undefined', async () => {
    const { useCase, tasksWriteRepo } = createUseCase();

    const result = await useCase.execute(
      new UpdateTaskSettingsCommand({ taskId: 'o::42', userId: 5, icon: undefined }),
    );

    expect(tasksWriteRepo.updateSettings).not.toHaveBeenCalled();
    expect(result).toMatchObject({ taskId: 42, icon: 'folder', isAllDay: false });
  });

  test('does not update repository when patch does not change settings', async () => {
    const currentSettings = TaskSettingsView.restore({ taskId: 42, icon: 'folder', isAllDay: false });
    const { useCase, tasksWriteRepo } = createUseCase({ currentSettings });

    const result = await useCase.execute(
      new UpdateTaskSettingsCommand({ taskId: 'o::42', userId: 5, icon: 'folder', isAllDay: false }),
    );

    expect(tasksWriteRepo.updateSettings).not.toHaveBeenCalled();
    expect(result).toBe(currentSettings);
  });
});
