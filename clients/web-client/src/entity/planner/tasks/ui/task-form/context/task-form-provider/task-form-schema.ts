import { timeAndDate } from '@big-d/time';
import { z } from 'zod';
import { Brand } from '@/shared/lib';
import { RecurrenceFrequency, TaskPriority, TaskRecurrenceWeekday, TaskStatus } from '@/shared/transport/graphql';
import { transformToPlaceholder, transformDate, schemaPlaceholderValues } from '@/shared/ui-kit/form';
import { TaskDomain } from '../../../../model';

type GroupBrand = Brand<number, string>;

const brandGroupSchema = <TGroupId extends GroupBrand>() =>
  z.custom<TGroupId>((value) => typeof value === 'number', { error: 'Некорректный идентификатор группы' });

const taskFormSchema = <TGroupId extends Brand<number, string>>() => {
  const dateSchema = z
    .date()
    .or(z.literal(schemaPlaceholderValues.date))
    .transform((date) => (date != null ? TaskDomain.dateToTaskStandard(date) : transformDate.dateToISOSFormat(date)));

  const baseSchema = z
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

      startDate: dateSchema.optional(),

      deadline: dateSchema.optional(),
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

  const recurrenceBaseSchema = baseSchema.safeExtend({
    isRecurrence: z.literal(true),
    startDate: z.date({ error: 'Дата начала обязательное поле' }).transform(TaskDomain.dateToTaskStandard),
    deadline: z.date({ error: 'Дедлайн обязательное поле' }).transform(TaskDomain.dateToTaskStandard),
  });

  const weeklyRecurrenceSchema = recurrenceBaseSchema.safeExtend({
    frequency: z.literal(RecurrenceFrequency.Weekly),
    weekdays: z
      .array(z.enum(TaskRecurrenceWeekday), { error: 'Минимум один день недели' })
      .min(1, { error: 'Минимум один день недели' })
      .max(7),
    monthdays: z.unknown(),
  });

  const monthlyRecurrenceSchema = recurrenceBaseSchema.safeExtend({
    frequency: z.literal(RecurrenceFrequency.Monthly),
    monthdays: z.array(z.number().int().min(1).max(31)).min(1),
    weekdays: z.unknown(),
  });

  const dailyRecurrenceSchema = recurrenceBaseSchema.safeExtend({
    frequency: z.literal(RecurrenceFrequency.Daily),
    weekdays: z.unknown(),
    monthdays: z.unknown(),
  });

  const finiteRecurrenceShape = {
    isEndless: z.literal(false),
    untilDate: z
      .date({ error: 'Дата окончания повторения обязательное поле' })
      .transform((date) => timeAndDate(date).endOf('day').toDate())
      .transform(TaskDomain.dateToTaskStandard),
  };

  const endlessRecurrenceShape = {
    isEndless: z.literal(true),
    untilDate: z.unknown(),
  };

  const weeklyRecurrenceByEndSchema = z.discriminatedUnion('isEndless', [
    weeklyRecurrenceSchema.safeExtend(finiteRecurrenceShape),
    weeklyRecurrenceSchema.safeExtend(endlessRecurrenceShape),
  ]);

  const monthlyRecurrenceByEndSchema = z.discriminatedUnion('isEndless', [
    monthlyRecurrenceSchema.safeExtend(finiteRecurrenceShape),
    monthlyRecurrenceSchema.safeExtend(endlessRecurrenceShape),
  ]);

  const dailyRecurrenceByEndSchema = z.discriminatedUnion('isEndless', [
    dailyRecurrenceSchema.safeExtend(finiteRecurrenceShape),
    dailyRecurrenceSchema.safeExtend(endlessRecurrenceShape),
  ]);

  const recurrenceEnabledSchema = z.discriminatedUnion('frequency', [
    weeklyRecurrenceByEndSchema,
    monthlyRecurrenceByEndSchema,
    dailyRecurrenceByEndSchema,
  ]);

  const recurrenceDisabledSchema = baseSchema.safeExtend({
    isRecurrence: z.literal(false),
    isEndless: z.boolean().optional(),
    untilDate: z.unknown(),
    frequency: z.unknown(),
    weekdays: z.unknown(),
    monthdays: z.unknown(),
  });

  const recurrenceSchema = z.discriminatedUnion('isRecurrence', [recurrenceEnabledSchema, recurrenceDisabledSchema]);

  return recurrenceSchema.check((ctx) => {
    if (!ctx.value.isRecurrence || ctx.value.isEndless) return;

    const { startDate, untilDate } = ctx.value;

    if (timeAndDate(startDate).isSameOrAfter(untilDate)) {
      ctx.issues.push({
        path: ['untilDate'],
        input: untilDate,
        code: 'custom',
        message: 'Дата завершения повторения не должна быть раньше даты начала',
      });
    }
  });
};
type TaskFormSchema<TGroupId extends GroupBrand> = ReturnType<typeof taskFormSchema<TGroupId>>;

type TaskFormData<TGroupId extends GroupBrand> = z.input<TaskFormSchema<TGroupId>>;

type TaskSubmitFormData<TGroupId extends GroupBrand> = z.output<TaskFormSchema<TGroupId>>;

export { taskFormSchema, type TaskFormData, type TaskSubmitFormData, type GroupBrand };
