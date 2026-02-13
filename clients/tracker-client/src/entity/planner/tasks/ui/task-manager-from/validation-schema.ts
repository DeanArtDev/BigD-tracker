import { taskPrioritySchema } from '@/entity/planner/tasks/lib/validation-schemas';
import { transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod';

const validationSchema = z
  .object({
    name: z
      .string({ error: '' })
      .min(4, { error: 'Не меньше 4 символов' })
      .max(254, { error: 'Слишком длинное имя' }),

    priority: z
      .enum(taskPrioritySchema)
      .optional()
      .or(z.literal(null))
      .transform(transformPlaceholder.optional),

    description: z.string().optional().transform(transformPlaceholder.optional),

    startDate: z.date().optional().or(z.literal(null)).transform(transformPlaceholder.isoDate),

    deadline: z.date().optional().or(z.literal(null)).transform(transformPlaceholder.isoDate),
  })
  .check((ctx) => {
    const { startDate, deadline } = ctx.value;

    if (deadline != null && startDate != null) {
      if (startDate >= deadline) {
        ctx.issues.push({
          path: ['deadline'],
          input: ctx.value.deadline,
          code: 'custom',
          message: 'Конец не может быть позже или равен началу',
        });
      }
    }
  });

export { validationSchema };
