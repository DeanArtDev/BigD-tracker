import { GroupStatus } from '@big-d/api-contracts';
import { assertGroupUpdate } from '../group.invariants';

describe('group invariants', () => {
  it('rejects updates for done groups', () => {
    expect(() =>
      assertGroupUpdate({
        status: GroupStatus.DONE,
      }),
    ).toThrow();
  });

  it('allows updates for active groups', () => {
    expect(() =>
      assertGroupUpdate({
        status: GroupStatus.NOT_STARTED,
      }),
    ).not.toThrow();
  });
});
