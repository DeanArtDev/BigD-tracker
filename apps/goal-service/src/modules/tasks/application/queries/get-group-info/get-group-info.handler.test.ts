import { groupReadRepoMock } from '@shared/__tests__';
import { GetGroupInfoHandler } from './get-group-info.handler';
import { GetGroupInfoQuery } from './get-group-info.query';

describe('GetGroupInfoHandler', () => {
  test('returns plain group info from repository', async () => {
    const groupInfo = { taskCount: 7 };
    groupReadRepoMock.getGroupInfo.mockResolvedValueOnce(groupInfo);
    const handler = new GetGroupInfoHandler(groupReadRepoMock);

    const result = await handler.execute(new GetGroupInfoQuery({ groupId: 42, userId: 5 }));

    expect(result).toEqual(groupInfo);
    expect(groupReadRepoMock.getGroupInfo).toHaveBeenCalledWith({ groupId: 42, userId: 5 });
  });
});
