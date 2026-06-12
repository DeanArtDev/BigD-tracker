import { z } from 'zod';
import {
  transformToPlaceholder,
  transformPrimitive,
  transformDate,
  schemaPlaceholderValues,
} from '@/shared/ui-kit/form';
import { taskPriorityEnumSchema } from '../../../lib';
import { TaskDomain } from '../../../model';

const taskFormSchema = z
  .object({
    name: z
      .string({ error: 'Обязательное поле' })
      .min(3, { error: 'Не меньше 3 символов' })
      .max(254, { error: 'Слишком длинное имя' }),

    description: z.string().optional().transform(transformToPlaceholder.optional),

    priority: z.enum(taskPriorityEnumSchema).transform(transformPrimitive.toNumber),

    groupId: z.coerce
      .number()
      .optional()
      .transform((value) => transformPrimitive.toNumber(value === 0 ? 'empty' : value)),

    startDate: z
      .date()
      .optional()
      .or(z.literal(schemaPlaceholderValues.date))
      .transform((date) => (date != null ? TaskDomain.dateToTaskStandard(date) : transformDate.dateToISOSFormat(date))),

    deadline: z
      .date()
      .optional()
      .or(z.literal(schemaPlaceholderValues.date))
      .transform((date) => (date != null ? TaskDomain.dateToTaskStandard(date) : transformDate.dateToISOSFormat(date))),
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

type TaskFormData = z.input<typeof taskFormSchema>;
type TaskSubmitFormData = z.output<typeof taskFormSchema>;

export { taskFormSchema, type TaskFormData, type TaskSubmitFormData };
