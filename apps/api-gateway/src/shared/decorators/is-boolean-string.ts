import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

function IsBooleanString() {
  return applyDecorators(
    Transform(({ value }) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const val = value.toLowerCase();
        if (val === 'true' || val === '1') return true;
        if (val === 'false' || val === '0') return false;
      }
      return value;
    }),
    IsBoolean(),
  );
}

export { IsBooleanString };
