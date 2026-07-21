import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@/entity/schema-types';
import { transformToPlaceholder, transformDate, schemaPlaceholderValues } from '@/shared/ui-kit/form';
import { TaskDomain } from '../../../../model';

const taskFormSchema = z
  .object({
    name: z
      .string({ error: 'Имя обязательное поле' })
      .min(3, { error: 'Имя должно иметь не меньше 3 символов' })
      .max(254, { error: 'Слишком длинное имя' }),

    isDescriptionDirty: z.boolean(),
    description: z.string().optional().transform(transformToPlaceholder.optional),

    priority: z.enum(TaskPriority),

    status: z.enum(TaskStatus).optional(),

    groupId: z.number().optional(),

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
