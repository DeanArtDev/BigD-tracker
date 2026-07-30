import { z } from 'zod';
import { Brand } from '@/shared/lib';
import { TaskPriority, TaskStatus } from '@/shared/transport/graphql';
import { transformToPlaceholder, transformDate, schemaPlaceholderValues } from '@/shared/ui-kit/form';
import { TaskDomain } from '../../../../model';

type GroupBrand = Brand<number, string>;

const brandGroupSchema = <TGroupId extends GroupBrand>() =>
  z.custom<TGroupId>((value) => typeof value === 'number', { error: 'Некорректный идентификатор группы' });

const taskFormSchema = <TGroupId extends Brand<number, string>>() =>
  z
    .object({
      name: z
        .string({ error: 'Имя обязательное поле' })
        .min(3, { error: 'Имя должно иметь не меньше 3 символов' })
        .max(254, { error: 'Слишком длинное имя' }),

      isDescriptionDirty: z.boolean(),
      description: z.string().optional().transform(transformToPlaceholder.optional),

      priority: z.enum(TaskPriority),

      status: z.enum(TaskStatus).optional(),

      groupId: brandGroupSchema<TGroupId>().optional(),

      startDate: z
        .date()
        .optional()
        .or(z.literal(schemaPlaceholderValues.date))
        .transform((date) =>
          date != null ? TaskDomain.dateToTaskStandard(date) : transformDate.dateToISOSFormat(date),
        ),

      deadline: z
        .date()
        .optional()
        .or(z.literal(schemaPlaceholderValues.date))
        .transform((date) =>
          date != null ? TaskDomain.dateToTaskStandard(date) : transformDate.dateToISOSFormat(date),
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

type TaskFormSchema<TGroupId extends GroupBrand> = ReturnType<typeof taskFormSchema<TGroupId>>;

type TaskFormData<TGroupId extends GroupBrand> = z.input<TaskFormSchema<TGroupId>>;

type TaskSubmitFormData<TGroupId extends GroupBrand> = z.output<TaskFormSchema<TGroupId>>;

export { taskFormSchema, type TaskFormData, type TaskSubmitFormData, type GroupBrand };
