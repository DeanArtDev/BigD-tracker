import { GroupId } from '@/entity/planner/groups';
import { GroupTaskOrder } from '@/entity/schema-types';
import { GetDetailedGroupByIdDocument } from './schemas/group-page.schema.generated';

function shapeGetDetailedGroupOptions(input: { groupId?: GroupId }) {
  return {
    query: GetDetailedGroupByIdDocument,
    variables: { input: { groupId: input.groupId! }, tasksInput: { order: GroupTaskOrder.Group } },
  };
}

export { shapeGetDetailedGroupOptions };
