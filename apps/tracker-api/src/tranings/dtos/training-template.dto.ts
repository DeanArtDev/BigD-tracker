import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { TrainingDto } from './training.dto';

class TrainingTemplateDto extends OmitType(TrainingDto, [
  'userId',
  'startDate',
  'endDate',
] as const) {
  @ApiPropertyOptional()
  @IsInt()
  @Expose()
  @IsOptional()
  userId?: number;
}

export { TrainingTemplateDto };
