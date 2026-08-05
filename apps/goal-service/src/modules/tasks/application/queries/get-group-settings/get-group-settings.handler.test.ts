import { DEFAULT_GROUP_SETTINGS } from '@/modules/tasks/domain/constants';
import { groupReadRepoMock } from '@shared/__tests__';
import { ExceptionGroupSettingsNotFound } from '../../exceptions';
import { GetGroupSettingsHandler } from './get-group-settings.handler';
import { GetGroupSettingsQuery } from './get-group-settings.query';

describe('GetGroupSettingsHandler', () => {
  const input = { groupId: 42, userId: 5 };
  const settings = { groupId: input.groupId, ...DEFAULT_GROUP_SETTINGS };
  const trx = { id: 333, trueTransaction: true };
  const db = { runTransaction: jest.fn().mockImplementation(async (work) => await work(trx)) };

  test('returns group settings from repository', async () => {
    groupReadRepoMock.getSettings.mockResolvedValueOnce(settings);
    const handler = new GetGroupSettingsHandler(db as never, groupReadRepoMock);

    const result = await handler.execute(new GetGroupSettingsQuery(input));

    expect(result).toEqual(settings);
    expect(db.runTransaction).toHaveBeenCalledTimes(1);
    expect(groupReadRepoMock.getSettings).toHaveBeenCalledWith(input, trx);
  });

  test('throws when group settings are unavailable for user', async () => {
    groupReadRepoMock.getSettings.mockResolvedValueOnce(null);
    const handler = new GetGroupSettingsHandler(db as never, groupReadRepoMock);

    await expect(handler.execute(new GetGroupSettingsQuery(input))).rejects.toBeInstanceOf(
      ExceptionGroupSettingsNotFound,
    );
  });
});
