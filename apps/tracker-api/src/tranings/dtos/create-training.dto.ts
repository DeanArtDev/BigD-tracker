import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { TrainingDto } from './training.dto';

class CreateTrainingRequestData extends OmitType(TrainingDto, [
  'id',
  'createdAt',
  'updatedAt',
  'endDate',
  'userId',
] as const) {}

class CreateTrainingRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateTrainingRequestData,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateTrainingRequestData)
  data: CreateTrainingRequestData[];
}

class CreateTrainingResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => TrainingDto)
  data: TrainingDto[];
}

export { CreateTrainingRequest, CreateTrainingResponse, CreateTrainingRequestData };
