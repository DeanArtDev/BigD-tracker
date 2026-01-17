import { GroupsReadRepository, GroupsWriteRepository } from '@/modules/tasks/application/ports';
import { Group } from '@/modules/tasks/domain/aggregates/group';
import { GroupReadKyselyMapper } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.read-mapper';
import { GroupWriteKyselyMapper } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.write-mapper';
import { GroupsToken } from '@/modules/tasks/tokens';
import { GoalCreateGroup } from '@big-d/api-contracts';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { buildPayload, connectRmqClients, createTestingModule } from '@shared/__tests__';
import { getGroupRaw } from '@shared/__tests__/entities';
import { firstValueFrom, timeout } from 'rxjs';

const groupWriteRepoMock: Record<keyof GroupsWriteRepository, jest.Mock> = {
  createGroup: jest.fn(),
  deleteById: jest.fn(),
  getGroupById: jest.fn(),
  replaceGroupWithTasks: jest.fn(),
};

const groupReadRepoMock: Record<keyof GroupsReadRepository, jest.Mock> = {
  getByName: jest.fn(),
  getGroupById: jest.fn(),
  getGroupWithTasksById: jest.fn(),
  ensureTaskInGroup: jest.fn(),
  getGroupListWithTasksByUserId: jest.fn(),
};

describe('GroupsRmqController (rmq e2e)', () => {
  let ms: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleRef = await createTestingModule()
      .overrideProvider(GroupsToken.WRITE_REPOSITORY)
      .useValue(groupWriteRepoMock)
      .overrideProvider(GroupsToken.READ_REPOSITORY)
      .useValue(groupReadRepoMock)
      .compile();

    const resp = await connectRmqClients({
      testingModule: moduleRef,
    });

    ms = resp.microservice;
    client = resp.client;
  });

  afterAll(async () => {
    await client.close();
    await ms.close();
  });

  test(`${GoalCreateGroup.pattern} should work`, async () => {
    const groupRaw = getGroupRaw({ user_id: 1, name: 'G1', description: '<b>hi</b>' });
    groupReadRepoMock.getGroupById.mockResolvedValueOnce(
      GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRaw, tasks: [] }),
    );
    groupWriteRepoMock.createGroup.mockResolvedValueOnce(
      GroupWriteKyselyMapper.fromRawToAgr(groupRaw),
    );
    const payload: GoalCreateGroup.Request = buildPayload({
      data: { userId: groupRaw.user_id, name: groupRaw.name, description: groupRaw.description },
    });

    const res = await firstValueFrom(
      client.send<GoalCreateGroup.Response>(GoalCreateGroup.pattern, payload).pipe(timeout(2000)),
    );

    const [[arg]] = groupWriteRepoMock.createGroup.mock.calls;
    expect(arg).toBeInstanceOf(Group);
    expect(arg.id).toEqual(NaN);
    expect(arg.name).toEqual(groupRaw.name);
    expect(arg.description).toEqual(groupRaw.description);
    expect(arg.status).toEqual(groupRaw.status);
    expect(arg.userId).toEqual(groupRaw.user_id);
    expect(arg.progress).toEqual(groupRaw.progress);
    expect(res).toEqual({
      data: {
        id: groupRaw.id,
        name: groupRaw.name,
        description: groupRaw.description,
        status: groupRaw.status,
        userId: groupRaw.user_id,
        progress: groupRaw.progress,
        tasks: [],
      },
    });
  });
});
