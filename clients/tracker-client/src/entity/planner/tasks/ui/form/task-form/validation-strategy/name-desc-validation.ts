import { formPlaceholderValues, formTransform, transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod';
import { taskPrioritySchema } from '../../../../lib/validation-schemas';

const nameDescValidation = z.object({
  name: z
    .string({ error: '' })
    .min(3, { error: 'Не меньше 3 символов' })
    .max(254, { error: 'Слишком длинное имя' }),

  priority: z.enum(taskPrioritySchema),

  description: z.string().optional().transform(transformPlaceholder.optional),
  isDescriptionDirty: z.boolean(),

  weight: z
    .number({ error: '' })
    .max(100, { error: 'Не больше 100' })
    .positive({ error: 'Только больше 0' })
    .transform(transformPlaceholder.percentNumber),

  startDate: z
    .date()
    .optional()
    .or(z.literal(formPlaceholderValues.date))
    .transform(formTransform.dateToISOSFormat),

  deadline: z
    .date()
    .optional()
    .or(z.literal(formPlaceholderValues.date))
    .transform(formTransform.dateToISOSFormat),
});

export { nameDescValidation };
