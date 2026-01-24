import { TaskPriority } from '@/entity/planner/tasks';
import { transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod/v4';

const validationThingPriority = Object.values(TaskPriority)
  .filter((v) => typeof v === 'number')
  .map(String);

const validationSchema = z
  .object({
    name: z
      .string({ error: '' })
      .min(4, { error: 'Не меньше 4 символов' })
      .max(254, { error: 'Слишком длинное имя' }),

    priority: z
      .enum(validationThingPriority)
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
