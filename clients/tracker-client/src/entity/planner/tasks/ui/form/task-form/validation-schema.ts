import { taskPrioritySchema } from '../../../lib/validation-schemas';
import { transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod';

const validationSchema = z.object({
  name: z
    .string({ error: '' })
    .min(3, { error: 'Не меньше 3 символов' })
    .max(254, { error: 'Слишком длинное имя' }),

  priority: z
    .enum(taskPrioritySchema)
    .optional()
    .or(z.literal(null))
    .transform(transformPlaceholder.optional),

  description: z.string().optional().transform(transformPlaceholder.optional),
  isDescriptionDirty: z.boolean(),

  deadline: z.date().optional().or(z.literal(null)).transform(transformPlaceholder.isoDate),
});

type TaskFormData = z.input<typeof validationSchema>;
type TaskSubmitFormData = z.output<typeof validationSchema>;

export { validationSchema, type TaskFormData, type TaskSubmitFormData };
