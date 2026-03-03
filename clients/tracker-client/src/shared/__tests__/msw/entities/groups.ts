import type { ApiSchemas } from '@/shared/api/types';
import { http, HttpResponse } from 'msw';
import { server } from '../server';

type AssignableGroupFixture = Partial<ApiSchemas['GroupInfoDto']> & Pick<ApiSchemas['GroupInfoDto'], 'id' | 'name'>;

function getAssignableGroupFixture(fixture: AssignableGroupFixture): ApiSchemas['GroupInfoDto'] {
  return {
    id: fixture.id,
    name: fixture.name,
  };
}

function mockGetAssignableGroups(fixtures: AssignableGroupFixture[]) {
  server.use(
    http.get('*/api/groups/assignable', () => {
      return HttpResponse.json({
        data: fixtures.map(getAssignableGroupFixture),
      });
    }),
  );
}

export { mockGetAssignableGroups, getAssignableGroupFixture };
