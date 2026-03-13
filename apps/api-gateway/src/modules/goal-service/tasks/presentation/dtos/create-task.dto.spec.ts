import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTaskReq } from './create-task.dto';

describe('CreateTaskReq', () => {
  test('accepts startDate and deadline without seconds', async () => {
    const dto = plainToInstance(CreateTaskReq, {
      data: {
        name: 'Task',
        priority: 4,
        weight: 100,
        startDate: '2026-03-12T02:03',
        deadline: '2026-03-12T04:04',
      },
    });

    await expect(validate(dto)).resolves.toEqual([]);
  });

  test('rejects startDate with timezone suffix', async () => {
    const dto = plainToInstance(CreateTaskReq, {
      data: {
        name: 'Task',
        priority: 4,
        weight: 100,
        startDate: '2026-03-12T02:03Z',
        deadline: '2026-03-12T04:04',
      },
    });

    const errors = await validate(dto);
    const startDateError = errors[0]?.children?.find((child) => child.property === 'startDate');

    expect(startDateError?.constraints).toEqual({
      IsAbsoluteDateTimeWithoutTimezone: 'startDate must be in format YYYY-MM-DDTHH:mm without timezone',
    });
  });

  test('rejects deadline with seconds', async () => {
    const dto = plainToInstance(CreateTaskReq, {
      data: {
        name: 'Task',
        priority: 4,
        weight: 100,
        startDate: '2026-03-12T02:03',
        deadline: '2026-03-12T04:04:05',
      },
    });

    const errors = await validate(dto);
    const deadlineError = errors[0]?.children?.find((child) => child.property === 'deadline');

    expect(deadlineError?.constraints).toEqual({
      IsAbsoluteDateTimeWithoutTimezone: 'deadline must be in format YYYY-MM-DDTHH:mm without timezone',
    });
  });
});
