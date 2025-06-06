import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { TrainingDto } from './training.dto';

class TrainingTemplateDto extends OmitType(TrainingDto, [
  'startDate',
  'endDate',
  'userId',
] as const) {
  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Expose()
  @IsOptional()
  userId?: number;
}

export { TrainingTemplateDto };
