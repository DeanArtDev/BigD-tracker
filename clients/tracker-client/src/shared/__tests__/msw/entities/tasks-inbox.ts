import type { ApiSchemas } from '@/shared/api/types';
import { http, HttpResponse } from 'msw';
import { server } from '../server';

type InboxTaskFixture = Partial<ApiSchemas['TaskDto']> & Pick<ApiSchemas['TaskDto'], 'id' | 'name'>;

function getInboxTaskFixture(fixture: InboxTaskFixture): ApiSchemas['TaskDto'] {
  return {
    id: fixture.id,
    name: fixture.name,
    userId: fixture.userId ?? 1,
    priority: fixture.priority ?? 2,
    status: fixture.status ?? 'NOT_STARTED',
    groupId: fixture.groupId,
    description: fixture.description,
    endDate: fixture.endDate,
    startDate: fixture.startDate,
    deadline: fixture.deadline,
    cancelReason: fixture.cancelReason,
    recurrence: fixture.recurrence,
  };
}

function mockGetInboxTasks(fixtures: InboxTaskFixture[]) {
  server.use(
    http.get('*/api/groups/inbox', () => {
      return HttpResponse.json({
        data: {
          id: 1,
          name: 'Inbox',
          tasks: fixtures.map(getInboxTaskFixture),
        },
      });
    }),
  );
}

export { mockGetInboxTasks, getInboxTaskFixture };
