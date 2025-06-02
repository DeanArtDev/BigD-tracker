import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

function IsNullable() {
  return applyDecorators(
    IsOptional(),
    Transform(({ value }) => (value === undefined ? null : value)),
  );
}

export { IsNullable };
