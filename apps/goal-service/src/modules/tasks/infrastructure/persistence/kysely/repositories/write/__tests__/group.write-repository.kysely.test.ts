import { TasksDB } from '@/modules/tasks/application/ports';
import { GroupById, GroupByUserId, groupsCombinators } from '@/modules/tasks/application/specifications';
import { groupsQuerySpec } from '@/modules/tasks/domain';
import { GroupFactory } from '@/modules/tasks/domain/aggregates/group';
import { DEFAULT_GROUP_SETTINGS } from '@/modules/tasks/domain/constants';
import { GroupStatus } from '@big-d/api-contracts';
import { expectSqlQuery, withRepository } from '@shared/__tests__';
import { GroupWriteKyselyMapper } from '../../../mappers/groups.write-mapper';
import { GroupWriteRepositoryKysely } from '../group.write-repository.kysely';

describe('GroupWriteRepositoryKysely', () => {
  test('createGroup returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupWriteRepositoryKysely>(
      (db) => new GroupWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const group = new GroupFactory().create({ userId: 77, name: 'Group Name', description: 'Desc' });

        recorder.enqueueResult({
          rows: [{ id: 1, name: 'NOT_STARTED' }],
        });
        recorder.enqueueResult({
          rows: [
            {
              id: 101,
              name: 'Group Name',
              user_id: 77,
              progress: 0,
              description: 'Desc',
            },
          ],
        });
        recorder.enqueueResult({ numAffectedRows: 1n });

        await repository.createGroup(group);

        expect(recorder.queries).toHaveLength(3);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "id",
            "name"
          from "group_statuses"
          where "name" = $1
        `,
          parameters: ['NOT_STARTED'],
        });
        expectSqlQuery(recorder.queries[1], {
          sql: `
          insert into "groups"
            ("name", "user_id", "description", "status_id")
          values
            ($1, $2, $3, $4)
          returning
            "id",
            "name",
            "user_id",
            "progress",
            "description"
        `,
          parameters: ['Group Name', 77, 'Desc', 1],
        });
        expectSqlQuery(recorder.queries[2], {
          sql: `
          insert into "group_settings"
            (
              "group_id",
              "event_color",
              "event_selected_color",
              "line_color",
              "text_color",
              "event_color_dark",
              "event_selected_color_dark",
              "line_color_dark",
              "text_color_dark",
              "is_default",
              "is_visible",
              "is_readonly"
            )
          values
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `,
          parameters: [
            101,
            DEFAULT_GROUP_SETTINGS.eventColor,
            DEFAULT_GROUP_SETTINGS.eventSelectedColor,
            DEFAULT_GROUP_SETTINGS.lineColor,
            DEFAULT_GROUP_SETTINGS.textColor,
            DEFAULT_GROUP_SETTINGS.eventColorDark,
            DEFAULT_GROUP_SETTINGS.eventSelectedColorDark,
            DEFAULT_GROUP_SETTINGS.lineColorDark,
            DEFAULT_GROUP_SETTINGS.textColorDark,
            DEFAULT_GROUP_SETTINGS.isDefault,
            DEFAULT_GROUP_SETTINGS.isVisible,
            DEFAULT_GROUP_SETTINGS.isReadonly,
          ],
        });
      },
    );
  });

  test('updateGroupAndTaskOrder recreates group links and synchronizes task membership', async () => {
    await withRepository<TasksDB, GroupWriteRepositoryKysely>(
      (db) => new GroupWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const group = GroupWriteKyselyMapper.fromRawToAgr({
          id: 901,
          user_id: 77,
          name: 'Group Name',
          description: 'Desc',
          progress: 0,
          status: GroupStatus.NOT_STARTED,
        });

        recorder.enqueueResult({ numAffectedRows: 1n });
        recorder.enqueueResult({ numAffectedRows: 2n });
        recorder.enqueueResult({ numAffectedRows: 2n });
        recorder.enqueueResult({ numAffectedRows: 0n });
        recorder.enqueueResult({ numAffectedRows: 2n });

        await repository.updateGroupAndTaskOrder({ group, taskIds: [11, 12] });

        expect(recorder.queries).toHaveLength(5);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          update "groups"
          set
            "name" = $1,
            "description" = $2
          where
            "id" = $3
            and "user_id" = $4
            and "name" not in ($5)
        `,
          parameters: ['Group Name', 'Desc', 901, 77, groupsQuerySpec.inboxName],
        });
        expectSqlQuery(recorder.queries[1], {
          sql: `
          delete from "task_to_group"
          where "group_id" = $1
        `,
          parameters: [901],
        });
        expectSqlQuery(recorder.queries[2], {
          sql: `
          insert into "task_to_group"
            ("task_id", "group_id", "position")
          values
            ($1, $2, $3),
            ($4, $5, $6)
        `,
          parameters: [11, 901, 0, 12, 901, 1],
        });
        expectSqlQuery(recorder.queries[3], {
          sql: `
          update "tasks"
          set "group_id" = $1
          where
            "group_id" = $2
            and "user_id" = $3
        `,
          parameters: [null, 901, 77],
        });
        expectSqlQuery(recorder.queries[4], {
          sql: `
          update "tasks"
          set "group_id" = $1
          where
            "id" in ($2, $3)
            and "user_id" = $4
        `,
          parameters: [901, 11, 12, 77],
        });
      },
    );
  });

  test('updateGroupAndTaskOrder with an empty task list clears group membership', async () => {
    await withRepository<TasksDB, GroupWriteRepositoryKysely>(
      (db) => new GroupWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const group = GroupWriteKyselyMapper.fromRawToAgr({
          id: 901,
          user_id: 77,
          name: 'Group Name',
          description: 'Desc',
          progress: 0,
          status: GroupStatus.NOT_STARTED,
        });

        recorder.enqueueResult({ numAffectedRows: 1n });
        recorder.enqueueResult({ numAffectedRows: 2n });
        recorder.enqueueResult({ numAffectedRows: 2n });

        await repository.updateGroupAndTaskOrder({ group, taskIds: [] });

        expect(recorder.queries).toHaveLength(3);
        expectSqlQuery(recorder.queries[1], {
          sql: `
          delete from "task_to_group"
          where "group_id" = $1
        `,
          parameters: [901],
        });
        expectSqlQuery(recorder.queries[2], {
          sql: `
          update "tasks"
          set "group_id" = $1
          where
            "group_id" = $2
            and "user_id" = $3
        `,
          parameters: [null, 901, 77],
        });
      },
    );
  });

  test('delete returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupWriteRepositoryKysely>(
      (db) => new GroupWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const specification = groupsCombinators.and(GroupByUserId(77), GroupById(901));

        recorder.enqueueResult({
          numAffectedRows: 1n,
        });
        await repository.delete(specification);

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          delete from "groups"
          where
            (
              "groups"."user_id" = $1
              and "groups"."id" = $2
            )
        `,
          parameters: [77, 901],
        });
      },
    );
  });

  test('updateSettings returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupWriteRepositoryKysely>(
      (db) => new GroupWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const patch = { eventColor: '#ABCDEF', isVisible: false };
        recorder.enqueueResult({ numAffectedRows: 1n });

        const result = await repository.updateSettings({ groupId: 42, patch });

        expect(result).toBe(true);
        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          update "group_settings"
          set
            "event_color" = $1,
            "is_visible" = $2
          where "group_id" = $3
        `,
          parameters: [patch.eventColor, patch.isVisible, 42],
        });
      },
    );
  });

  test('updateSettings keeps null in patch', async () => {
    await withRepository<TasksDB, GroupWriteRepositoryKysely>(
      (db) => new GroupWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({ numAffectedRows: 1n });

        await repository.updateSettings({ groupId: 42, patch: { eventColor: null as never } });

        expectSqlQuery(recorder.queries[0], {
          sql: `
          update "group_settings"
          set "event_color" = $1
          where "group_id" = $2
        `,
          parameters: [null, 42],
        });
      },
    );
  });
});
