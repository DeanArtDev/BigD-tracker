import { formPlaceholderValues, formTransform, transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod';
import { taskPrioritySchema } from '../../../../lib/validation-schemas';
import dayjs from '@/shared/lib/time';

const getNowTime = () => dayjs(new Date()).set('seconds', 59).set('milliseconds', 59).valueOf();

const maxLevelValidation = z
  .object({
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

    weight: z
      .number({ error: '' })
      .max(100, { error: 'Не больше 100' })
      .positive({ error: 'Только больше 0' })
      .transform(transformPlaceholder.percentNumber),

    startDate: z
      .date()
      .min(getNowTime(), { error: 'Начало не должно быть в прошлом' })
      .optional()
      .or(z.literal(formPlaceholderValues.date))
      .transform(formTransform.dateToISOSFormat),

    deadline: z
      .date()
      .min(getNowTime(), { error: 'Дедлайн не должен быть в прошлом' })
      .optional()
      .or(z.literal(formPlaceholderValues.date))
      .transform(formTransform.dateToISOSFormat),
  })
  .check((ctx) => {
    const { startDate, deadline } = ctx.value;
    if (deadline != null && startDate != null) {
      if (startDate >= deadline) {
        ctx.issues.push({
          path: ['deadline'],
          input: ctx.value.deadline,
          code: 'custom',
          message: 'Дедлайн не может быть позже или равен началу',
        });
      }
    }
  });

export { maxLevelValidation };
