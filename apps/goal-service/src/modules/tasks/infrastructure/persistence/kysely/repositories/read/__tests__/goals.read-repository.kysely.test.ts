import { GoalsDB } from '@/modules/tasks/application/ports';
import { expectSqlQuery, withRepository } from '@shared/__tests__';
import { GoalsReadRepositoryKysely } from '../goals.read-repository.kysely';

describe('GoalsReadRepositoryKysely', () => {
  test('getGoalInfoByChildGroups returns expected sql and params', async () => {
    await withRepository<GoalsDB, GoalsReadRepositoryKysely>(
      (db) => new GoalsReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.getGoalInfoByChildGroups({ groupIds: [11, 12], userId: 7 });

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "groups"."id" as "groupId",
            "goals"."id" as "goalId",
            goal_statuses.name as "goalStatus"
          from "groups"
          inner join "group_to_goals"
            on "group_to_goals"."group_id" = "groups"."id"
          inner join "goals"
            on "group_to_goals"."goal_id" = "goals"."id"
          inner join "goal_statuses"
            on "goal_statuses"."id" = "goals"."status_id"
          where
            "goals"."user_id" = $1
            and "groups"."user_id" = $2
            and "groups"."id" in ($3, $4)
        `,
          parameters: [7, 7, 11, 12],
        });
      },
    );
  });
});
