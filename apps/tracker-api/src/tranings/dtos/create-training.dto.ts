import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { TrainingDto } from './training.dto';

class TrainingRequest extends OmitType(TrainingDto, ['id', 'createdAt'] as const) {}

class CreateTrainingRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: TrainingRequest,
  })
  @ValidateNested()
  @Type(() => TrainingRequest)
  data: TrainingRequest;
}

class CreateTrainingResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingDto,
  })
  @ValidateNested()
  @Type(() => TrainingDto)
  data: TrainingDto;
}

export { CreateTrainingRequest, CreateTrainingResponse };
