import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString } from '@shared/decorators/is-boolean-string';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

class GetExerciseQuery {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Expose()
  @IsBooleanString()
  my?: boolean;
}

export { GetExerciseQuery };
