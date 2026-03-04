import { initTestEnvironment } from '@/../jest.setup';
import { GoalsToken, GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalGetAssignableGroups, GoalStatus } from '@big-d/api-contracts';
import { specToDebugString } from '@big-d/api-utils';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildPayload,
  connectRmqClients,
  createTestingModule,
  expectTransaction,
  firstArg,
  mockDate,
  nthArgs,
  sendMessageBuilder,
} from '@shared/__tests__';
import { getGroupInfoView } from '@shared/__tests__/entities';
import { goalsReadRepoMock, groupReadRepoMock, groupWriteRepoMock, tasksWriteRepoMock } from '@shared/__tests__';

initTestEnvironment();
mockDate();

describe('GroupsRmqController (rmq e2e)', () => {
  let ms: INestMicroservice;
  let client: ClientProxy;
  let sendMessage: ReturnType<typeof sendMessageBuilder>;

  beforeAll(async () => {
    const moduleRef = await createTestingModule()
      .overrideProvider(GroupsToken.WRITE_REPOSITORY)
      .useValue(groupWriteRepoMock)
      .overrideProvider(GroupsToken.READ_REPOSITORY)
      .useValue(groupReadRepoMock)
      .overrideProvider(GoalsToken.READ_REPOSITORY)
      .useValue(goalsReadRepoMock)
      .overrideProvider(TasksToken.WRITE_REPOSITORY)
      .useValue(tasksWriteRepoMock)
      .compile();

    const resp = await connectRmqClients({
      testingModule: moduleRef,
    });

    ms = resp.microservice;
    client = resp.client;
    sendMessage = sendMessageBuilder(client);
  });

  afterAll(async () => {
    await client.close();
    await ms.close();
  });

  describe(`${GoalGetAssignableGroups.pattern}`, () => {
    test('should return only groups not tied to started goals', async () => {
      const groupA = getGroupInfoView({ id: 501, name: 'Group A' });
      const groupB = getGroupInfoView({ id: 502, name: 'Group B' });
      const groupC = getGroupInfoView({ id: 503, name: 'Group C' });

      groupReadRepoMock.getInfoGroups.mockResolvedValueOnce([groupA, groupB, groupC]);
      goalsReadRepoMock.getGoalInfoByChildGroups.mockResolvedValueOnce([
        { groupId: groupB.id, goalId: 9001, goalStatus: GoalStatus.NOT_STARTED },
        { groupId: groupC.id, goalId: 9002, goalStatus: GoalStatus.IN_PROGRESS },
      ]);

      const payload: GoalGetAssignableGroups.Request = buildPayload({
        data: { userId: 300 },
      });

      const res = await sendMessage<GoalGetAssignableGroups.Response, GoalGetAssignableGroups.Request>(
        GoalGetAssignableGroups.pattern,
        payload,
      );

      expect(groupReadRepoMock.getInfoGroups).toHaveBeenCalledTimes(1);
      expect(goalsReadRepoMock.getGoalInfoByChildGroups).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(groupReadRepoMock.getInfoGroups))).toMatchInlineSnapshot(`
          "AND(
            groups.byUserId,
            NOT(
              groups.byStatus
            )
          )"
      `);
      expect(nthArgs(1, groupReadRepoMock.getInfoGroups)).toEqual(expectTransaction());
      expect(nthArgs(1, goalsReadRepoMock.getGoalInfoByChildGroups)).toEqual(expectTransaction());
      expect(res).toEqual({ data: [groupA, groupB] });
    });
  });
});
