import { TasksDB } from '@/modules/tasks/application/ports';
import { GroupSettingsView } from '@/modules/tasks/application/dto';
import { groupsQuerySpec } from '@/modules/tasks/domain';
import { expectSqlQuery, withRepository } from '@shared/__tests__';
import { GroupInboxWriteRepositoryKysely } from '../group-inbox.write-repository.kysely';

describe('GroupInboxWriteRepositoryKysely', () => {
  test('createInbox returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupInboxWriteRepositoryKysely>(
      (db) => new GroupInboxWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({
          rows: [{ id: 1, name: 'IN_PROGRESS' }],
        });
        recorder.enqueueResult({
          rows: [{ id: 10, name: groupsQuerySpec.inboxName, user_id: 77 }],
        });
        recorder.enqueueResult({ numAffectedRows: 1n });

        await repository.createInbox({ userId: 77 });

        expect(recorder.queries).toHaveLength(3);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "id",
            "name"
          from "group_statuses"
          where "name" = $1
        `,
          parameters: ['IN_PROGRESS'],
        });
        expectSqlQuery(recorder.queries[1], {
          sql: `
          insert into "groups"
            ("name", "user_id", "status_id")
          values
            ($1, $2, $3)
          returning
            "id",
            "name",
            "user_id"
        `,
          parameters: [groupsQuerySpec.inboxName, 77, 1],
        });
        const settings = GroupSettingsView.create({ groupId: 10 });
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
            settings.groupId,
            settings.eventColor,
            settings.eventSelectedColor,
            settings.lineColor,
            settings.textColor,
            settings.eventColorDark,
            settings.eventSelectedColorDark,
            settings.lineColorDark,
            settings.textColorDark,
            settings.isDefault,
            settings.isVisible,
            settings.isReadonly,
          ],
        });
      },
    );
  });
});
