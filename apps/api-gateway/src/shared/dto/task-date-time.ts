import { ApiPropertyOptions } from '@nestjs/swagger';

const TASK_DATE_TIME_EXAMPLE = '2026-03-11T21:04';
const TASK_DATE_TIME_DESCRIPTION =
  'Абсолютная точка во времени без локализации и без таймзоны. Формат: 2026-03-11T21:04';

function buildTaskDateTimeApiProperty(description?: string): Pick<ApiPropertyOptions, 'example' | 'description'> {
  return {
    example: TASK_DATE_TIME_EXAMPLE,
    description: description != null ? `${description}. ${TASK_DATE_TIME_DESCRIPTION}` : TASK_DATE_TIME_DESCRIPTION,
  };
}

export { TASK_DATE_TIME_DESCRIPTION, TASK_DATE_TIME_EXAMPLE, buildTaskDateTimeApiProperty };
