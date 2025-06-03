import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsNullable } from '@shared/decorators/is-nullable';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TrainingDto } from './training.dto';

class PutTrainingRequestData extends OmitType(TrainingDto, [
  'userId',
  'createdAt',
  'updatedAt',
  'description',
  'endDate',
  'wormUpDuration',
  'postTrainingDuration',
] as const) {
  @ApiPropertyOptional({
    example: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
    nullable: true,
  })
  @IsString()
  @Expose()
  @IsOptional()
  @IsNullable()
  description?: string | null;

  @ApiPropertyOptional({
    example: 300000,
    description: 'измеряется в миллисекундах',
    nullable: true,
  })
  @IsInt()
  @Expose()
  @IsOptional()
  @IsNullable()
  wormUpDuration?: number | null;

  @ApiPropertyOptional({
    example: 300000,
    description: 'измеряется в миллисекундах',
    nullable: true,
  })
  @IsInt()
  @Expose()
  @IsOptional()
  @IsNullable()
  postTrainingDuration?: number | null;
}

class PutTrainingRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PutTrainingRequestData,
  })
  @ValidateNested()
  @Type(() => PutTrainingRequestData)
  data: PutTrainingRequestData;
}

class PutTrainingResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingDto,
  })
  @ValidateNested()
  @Type(() => TrainingDto)
  data: TrainingDto;
}

export { PutTrainingResponse, PutTrainingRequest, PutTrainingRequestData };
