import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TaskDto } from './task.dto';

describe('TaskDto', () => {
  test('accepts startDate, deadline and endDate without timezone', async () => {
    const dto = plainToInstance(TaskDto, {
      id: 'o::1',
      name: 'Task',
      userId: 1,
      priority: 4,
      status: 'IN_PROGRESS',
      startDate: '2026-03-12T02:03',
      deadline: '2026-03-12T04:04',
      endDate: '2026-03-12T05:05',
    });

    await expect(validate(dto)).resolves.toEqual([]);
  });

  test('rejects response dates with timezone', async () => {
    const dto = plainToInstance(TaskDto, {
      id: 'o::1',
      name: 'Task',
      userId: 1,
      priority: 4,
      status: 'IN_PROGRESS',
      startDate: '2026-03-12T02:03:00.000Z',
      deadline: '2026-03-12T04:04:00.000Z',
      endDate: '2026-03-12T05:05:00.000Z',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(3);
    expect(errors.map((error) => error.property)).toEqual(['endDate', 'startDate', 'deadline']);
    expect(errors.map((error) => error.constraints)).toEqual([
      {
        IsAbsoluteDateTimeWithoutTimezone: 'endDate must be in format YYYY-MM-DDTHH:mm without timezone',
      },
      {
        IsAbsoluteDateTimeWithoutTimezone: 'startDate must be in format YYYY-MM-DDTHH:mm without timezone',
      },
      {
        IsAbsoluteDateTimeWithoutTimezone: 'deadline must be in format YYYY-MM-DDTHH:mm without timezone',
      },
    ]);
  });
});
