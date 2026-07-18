import { z } from 'zod';
import { GroupId } from '@/entity/planner/groups';

const groupByIdPageSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .positive()
      .transform((value): GroupId => value as GroupId),
  }),
};

export { groupByIdPageSchema };
