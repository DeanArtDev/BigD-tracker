import { formPlaceholderValues, formTransform, transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod';
import { taskPrioritySchema } from '../../../../lib/validation-schemas';
import dayjs from '@/shared/lib/time';

const getNowTime = (): number =>
  dayjs(new Date()).set('seconds', 59).set('milliseconds', 59).valueOf();
const getStartOfToday = (): number => dayjs(getNowTime()).startOf('day').valueOf();

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
      .optional()
      .or(z.literal(formPlaceholderValues.date))
      .transform(formTransform.dateToISOSFormat)
      .refine(
        (startDate) => {
          if (startDate != null) {
            return dayjs(startDate).valueOf() >= getStartOfToday();
          }
          return true;
        },
        { error: 'Начало может быть только сегодня' },
      ),

    deadline: z
      .date()
      .optional()
      .or(z.literal(formPlaceholderValues.date))
      .transform(formTransform.dateToISOSFormat)
      .refine(
        (deadline) => {
          if (deadline != null) {
            return dayjs(deadline).valueOf() >= dayjs(getNowTime()).startOf('day').valueOf();
          }
          return true;
        },
        { error: 'Дедлайн не должен быть в прошлом' },
      ),
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
