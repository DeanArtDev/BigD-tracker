import { TaskRecurrenceFrequency } from '@/entity/planner/tasks';
import { isSameDay, isWithinCalendarDaysFromToday } from '@/shared/lib/time';
import { formPlaceholderValues, formTransform, transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod';
import {
  taskPriorityEnumSchema,
  taskRecurrenceFrequencyEnumSchema,
  taskTaskRecurrenceWeekdayEnumSchema,
} from '../../../../lib/validation-schemas';

const maxLevelValidation = z
  .object({
    name: z.string({ error: '' }).min(3, { error: 'Не меньше 3 символов' }).max(254, { error: 'Слишком длинное имя' }),

    priority: z.enum(taskPriorityEnumSchema).transform(formTransform.toNumber),

    description: z.string().optional().transform(transformPlaceholder.optional),
    isDescriptionDirty: z.boolean(),

    weight: z
      .number({ error: '' })
      .max(100, { error: 'Не больше 100' })
      .positive({ error: 'Только больше 0' })
      .transform(transformPlaceholder.percentNumber),

    startDate: z.date().optional().or(z.literal(formPlaceholderValues.date)).transform(formTransform.dateToISOSFormat),

    deadline: z.date().optional().or(z.literal(formPlaceholderValues.date)).transform(formTransform.dateToISOSFormat),

    isRecurrence: z.boolean(),
    recurrence: z
      .object({
        start: z.date().optional().or(z.literal(formPlaceholderValues.date)).transform(formTransform.dateToISOSFormat),

        end: z.date().optional().or(z.literal(formPlaceholderValues.date)).transform(formTransform.dateToISOSFormat),

        frequency: z
          .enum(taskRecurrenceFrequencyEnumSchema)
          .optional()
          .or(z.literal(null))
          .transform(transformPlaceholder.optional)
          .transform(formTransform.toNumber),

        weekdays: z
          .array(z.enum(taskTaskRecurrenceWeekdayEnumSchema))
          .optional()
          .transform(transformPlaceholder.optional),
      })
      .or(z.literal(null))
      .optional(),
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
  })
  .check((ctx) => {
    const { recurrence, startDate, deadline, isRecurrence } = ctx.value;
    const { start, end, weekdays, frequency } = recurrence ?? {};
    if (!isRecurrence) return;

    const isRecurrenceValuesEmpty =
      start == null || end == null || frequency == null || startDate == null || deadline == null;

    if (start == null) {
      ctx.issues.push({
        path: ['recurrence.start'],
        input: start,
        code: 'custom',
        message: 'Обязательное к заполнению поле',
      });
    }

    if (frequency == null) {
      ctx.issues.push({
        path: ['recurrence.frequency'],
        input: frequency,
        code: 'custom',
        message: 'Обязательное к заполнению поле',
      });
    }

    if (startDate == null) {
      ctx.issues.push({
        path: ['startDate'],
        input: startDate,
        code: 'custom',
        message: 'Обязательное к заполнению поле',
      });
    }

    if (deadline == null) {
      ctx.issues.push({
        path: ['deadline'],
        input: deadline,
        code: 'custom',
        message: 'Обязательное к заполнению поле',
      });
    }

    if (isRecurrenceValuesEmpty) return;

    if (frequency === TaskRecurrenceFrequency.WEEKLY && (weekdays?.length ?? 0) <= 0) {
      ctx.issues.push({
        path: ['recurrence.weekdays'],
        input: weekdays,
        code: 'custom',
        message: 'Укажите хотя бы один день недели',
      });
    }

    const message = `Дата начала и дата начала повторений должны быть в рамках одного дня`;

    if (!isSameDay(start, startDate)) {
      ctx.issues.push({
        path: ['recurrence.start'],
        input: start,
        code: 'custom',
        message,
      });

      ctx.issues.push({
        path: ['startDate'],
        input: startDate,
        code: 'custom',
        message,
      });
    }

    if (end != null && !isWithinCalendarDaysFromToday(end, 90)) {
      ctx.issues.push({
        path: ['recurrence.end'],
        input: end,
        code: 'custom',
        message: 'Диапазон от даты начала до окончания не может быть больше 90 дней',
      });
    }
  });

export { maxLevelValidation };
