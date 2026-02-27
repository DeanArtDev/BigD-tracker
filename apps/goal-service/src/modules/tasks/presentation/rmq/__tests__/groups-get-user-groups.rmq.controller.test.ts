import { initTestEnvironment } from '@/../jest.setup';
import { GroupReadKyselyMapper } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.read-mapper';
import { GoalsToken, GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalGetUserGroups } from '@big-d/api-contracts';
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
import { getGroupRaw, getTaskView } from '@shared/__tests__/entities';
import {
  goalsReadRepoMock,
  groupReadRepoMock,
  groupWriteRepoMock,
  tasksWriteRepoMock,
} from '@shared/__tests__/repository-mocks';

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

  describe(`${GoalGetUserGroups.pattern}`, () => {
    test('should return user groups', async () => {
      const taskView = getTaskView({ id: 91, userId: 7, name: 'T1', priority: 3, weight: 10 });
      const groupRaw = getGroupRaw({ id: 11, user_id: 7, name: 'Group 1' });
      const groupRawTwo = getGroupRaw({ id: 22, user_id: 7, name: 'Group 2' });
      groupReadRepoMock.getGroupListWithTasks.mockResolvedValueOnce([
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRaw, tasks: [taskView] }),
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRawTwo, tasks: [] }),
      ]);
      const payload: GoalGetUserGroups.Request = buildPayload({
        data: { userId: 7, limit: 1 },
      });

      const res = await sendMessage<GoalGetUserGroups.Response, GoalGetUserGroups.Request>(
        GoalGetUserGroups.pattern,
        payload,
      );

      expect(groupReadRepoMock.getGroupListWithTasks).toHaveBeenCalledTimes(1);
      expect(groupReadRepoMock.getGroupListWithTasks).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { limit: 1 },
        expectTransaction(),
      );
      expect(specToDebugString(firstArg(groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            groups.byUserId,
            NOT(
              groups.inbox
            )
          )"
      `);

      const secondArgs = nthArgs(1, groupReadRepoMock.getGroupListWithTasks);
      expect(specToDebugString(secondArgs)).toMatchInlineSnapshot(`
          "AND(
            tasks.byUserId,
            tasks.byStatus
          )"
      `);

      expect(res).toEqual({
        data: {
          items: [
            {
              id: groupRaw.id,
              name: groupRaw.name,
              description: groupRaw.description,
              status: groupRaw.status,
              userId: groupRaw.user_id,
              progress: groupRaw.progress,
              tasks: [
                {
                  id: taskView.id,
                  userId: taskView.userId,
                  name: taskView.name,
                  description: taskView.description,
                  priority: taskView.priority,
                  weight: taskView.weight,
                  cancelReason: taskView.cancelReason,
                  startDate: taskView.startDate,
                  endDate: taskView.endDate,
                  deadline: taskView.deadline,
                  status: taskView.status,
                  recurrence: taskView.recurrence,
                },
              ],
            },
            {
              id: groupRawTwo.id,
              name: groupRawTwo.name,
              description: groupRawTwo.description,
              status: groupRawTwo.status,
              userId: groupRawTwo.user_id,
              progress: groupRawTwo.progress,
              tasks: [],
            },
          ],

          meta: { cursor: 'eyJsYXN0SWQiOjIyfQ==' },
        },
      });
    });

    test('should include search and cursor in specifications and omit next cursor when last part', async () => {
      const userId = 8;
      const cursor = Buffer.from(
        JSON.stringify({ lastId: 10, search: 'Old', sort: ['name'], filter: ['active'] }),
        'utf8',
      ).toString('base64');
      const groupRaw = getGroupRaw({ id: 21, user_id: userId, name: 'Group A' });
      const groupRawTwo = getGroupRaw({ id: 22, user_id: userId, name: 'Group B' });
      groupReadRepoMock.getGroupListWithTasks.mockResolvedValueOnce([
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRaw, tasks: [] }),
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRawTwo, tasks: [] }),
      ]);
      const payload: GoalGetUserGroups.Request = buildPayload({
        data: { userId, limit: 5, search: 'Group', cursor },
      });

      const res = await sendMessage<GoalGetUserGroups.Response, GoalGetUserGroups.Request>(
        GoalGetUserGroups.pattern,
        payload,
      );

      expect(groupReadRepoMock.getGroupListWithTasks).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            groups.byUserId,
            groups.bySearch,
            groups.afterId,
            NOT(
              groups.inbox
            )
          )"
      `);
      expect(specToDebugString(nthArgs(1, groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            tasks.byUserId,
            tasks.byStatus
          )"
      `);
      expect(nthArgs(3, groupReadRepoMock.getGroupListWithTasks)).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          items: [
            {
              id: groupRaw.id,
              name: groupRaw.name,
              description: groupRaw.description,
              status: groupRaw.status,
              userId: groupRaw.user_id,
              progress: groupRaw.progress,
              tasks: [],
            },
            {
              id: groupRawTwo.id,
              name: groupRawTwo.name,
              description: groupRawTwo.description,
              status: groupRawTwo.status,
              userId: groupRawTwo.user_id,
              progress: groupRawTwo.progress,
              tasks: [],
            },
          ],
          meta: { cursor: undefined },
        },
      });
    });

    test('should return next cursor when cursor provided and page is full', async () => {
      const userId = 9;
      const search = 'Group';
      const sort = ['name'];
      const filter = ['active'];
      const cursor = Buffer.from(
        JSON.stringify({ lastId: 30, search, sort, filter }),
        'utf8',
      ).toString('base64');
      const groupRaw = getGroupRaw({ id: 31, user_id: userId, name: 'Group C' });
      const groupRawTwo = getGroupRaw({ id: 32, user_id: userId, name: 'Group D' });
      groupReadRepoMock.getGroupListWithTasks.mockResolvedValueOnce([
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRaw, tasks: [] }),
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRawTwo, tasks: [] }),
      ]);
      const payload: GoalGetUserGroups.Request = buildPayload({
        data: { userId, limit: 2, search, sort, filter, cursor },
      });

      const res = await sendMessage<GoalGetUserGroups.Response, GoalGetUserGroups.Request>(
        GoalGetUserGroups.pattern,
        payload,
      );

      expect(groupReadRepoMock.getGroupListWithTasks).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            groups.byUserId,
            groups.bySearch,
            groups.afterId,
            NOT(
              groups.inbox
            )
          )"
      `);
      expect(specToDebugString(nthArgs(1, groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            tasks.byUserId,
            tasks.byStatus
          )"
      `);
      expect(nthArgs(3, groupReadRepoMock.getGroupListWithTasks)).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          items: [
            {
              id: groupRaw.id,
              name: groupRaw.name,
              description: groupRaw.description,
              status: groupRaw.status,
              userId: groupRaw.user_id,
              progress: groupRaw.progress,
              tasks: [],
            },
            {
              id: groupRawTwo.id,
              name: groupRawTwo.name,
              description: groupRawTwo.description,
              status: groupRawTwo.status,
              userId: groupRawTwo.user_id,
              progress: groupRawTwo.progress,
              tasks: [],
            },
          ],
          meta: {
            cursor:
              'eyJsYXN0SWQiOjMyLCJzb3J0IjpbIm5hbWUiXSwic2VhcmNoIjoiR3JvdXAiLCJmaWx0ZXIiOlsiYWN0aXZlIl19',
          },
        },
      });
    });

    test('should return empty list when no groups found', async () => {
      groupReadRepoMock.getGroupListWithTasks.mockResolvedValueOnce([]);
      const payload: GoalGetUserGroups.Request = buildPayload({
        data: { userId: 77, limit: 10 },
      });

      const res = await sendMessage<GoalGetUserGroups.Response, GoalGetUserGroups.Request>(
        GoalGetUserGroups.pattern,
        payload,
      );

      expect(groupReadRepoMock.getGroupListWithTasks).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            groups.byUserId,
            NOT(
              groups.inbox
            )
          )"
      `);
      expect(specToDebugString(nthArgs(1, groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            tasks.byUserId,
            tasks.byStatus
          )"
      `);
      expect(nthArgs(3, groupReadRepoMock.getGroupListWithTasks)).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          items: [],
          meta: { cursor: undefined },
        },
      });
    });
  });
});
