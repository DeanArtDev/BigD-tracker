import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IsAbsoluteDateTimeWithoutTimezone } from './is-absolute-date-time-without-timezone.decorator';

class TestAbsoluteDateTimeDto {
  @IsAbsoluteDateTimeWithoutTimezone()
  value: string;
}

describe('IsAbsoluteDateTimeWithoutTimezone', () => {
  test('accepts datetime without timezone', async () => {
    const dto = plainToInstance(TestAbsoluteDateTimeDto, {
      value: '2026-03-12T02:03',
    });

    await expect(validate(dto)).resolves.toEqual([]);
  });

  test('rejects datetime with seconds', async () => {
    const dto = plainToInstance(TestAbsoluteDateTimeDto, {
      value: '2026-03-12T02:03:04',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
  });

  test('rejects datetime with timezone', async () => {
    const dto = plainToInstance(TestAbsoluteDateTimeDto, {
      value: '2026-03-12T02:03:04Z',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.constraints).toEqual({
      IsAbsoluteDateTimeWithoutTimezone: 'value must be in format YYYY-MM-DDTHH:mm without timezone',
    });
  });
});
