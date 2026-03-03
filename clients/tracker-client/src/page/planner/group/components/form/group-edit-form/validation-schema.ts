import { TaskStatus } from '@/entity/planner/tasks';
import { taskPriorityEnumSchema } from '@/entity/planner/tasks/lib/validation-schemas';
import { transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod';

const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  priority: z.enum(taskPriorityEnumSchema),
  description: z.string().optional().transform(transformPlaceholder.optional),
  deadline: z.string().optional().or(z.literal(null)).transform(transformPlaceholder.isoDate),
  startDate: z.string().optional().or(z.literal(null)).transform(transformPlaceholder.isoDate),
  weight: z.number().min(0).max(100),
  status: z.enum(TaskStatus),
});

const validationSchema = z.object({
  name: z
    .string({ error: '' })
    .min(3, { error: 'Не меньше 3 символов' })
    .max(254, { error: 'Слишком длинное имя' }),

  description: z.string().optional().transform(transformPlaceholder.optional),
  isDescriptionDirty: z.boolean(),

  tasks: z.array(taskSchema),
});

type GroupEditFormData = z.input<typeof validationSchema>;
type GroupEditSubmitFormData = z.output<typeof validationSchema>;

export { validationSchema, type GroupEditFormData, type GroupEditSubmitFormData };
