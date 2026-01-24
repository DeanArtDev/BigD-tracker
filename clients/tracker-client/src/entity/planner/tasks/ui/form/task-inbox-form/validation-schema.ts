import { TaskPriority } from '@/entity/planner/tasks';
import { transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod';

const validationThingPriority = Object.values(TaskPriority)
  .filter((v) => typeof v === 'number')
  .map(String);

const validationSchema = z.object({
  name: z
    .string({ error: '' })
    .min(3, { error: 'Не меньше 3 символов' })
    .max(254, { error: 'Слишком длинное имя' }),

  priority: z
    .enum(validationThingPriority)
    .optional()
    .or(z.literal(null))
    .transform(transformPlaceholder.optional),

  description: z.string().optional().transform(transformPlaceholder.optional),

  deadline: z.date().optional().or(z.literal(null)).transform(transformPlaceholder.isoDate),
});

type TaskInboxFormData = z.input<typeof validationSchema>;
type TaskInboxSubmitFormData = z.output<typeof validationSchema>;

export { validationSchema, type TaskInboxFormData, type TaskInboxSubmitFormData };
