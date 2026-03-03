import { taskPriorityEnumSchema } from '@/entity/planner/tasks/lib/validation-schemas';
import { formPlaceholderValues, transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod';

const validationSchema = z.object({
  name: z
    .string({ error: '' })
    .min(3, { error: 'Не меньше 3 символов' })
    .max(254, { error: 'Слишком длинное имя' }),

  priority: z
    .enum(taskPriorityEnumSchema)
    .optional()
    .or(z.literal(null))
    .transform(transformPlaceholder.optional),

  description: z.string().optional().transform(transformPlaceholder.optional),
  isDescriptionDirty: z.boolean(),

  deadline: z
    .date()
    .optional()
    .or(z.literal(formPlaceholderValues.date))
    .transform(transformPlaceholder.isoDate),
});

type TaskInboxFormData = z.input<typeof validationSchema>;
type TaskInboxSubmitFormData = z.output<typeof validationSchema>;

export { validationSchema, type TaskInboxFormData, type TaskInboxSubmitFormData };
