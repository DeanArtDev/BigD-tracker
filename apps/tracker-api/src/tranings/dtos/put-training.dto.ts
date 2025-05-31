import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { TrainingDto } from './training.dto';

class PutTrainingDto extends OmitType(TrainingDto, [
  'id',
  'userId',
  'createdAt',
] as const) {}

class PutTrainingRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PutTrainingDto,
  })
  @ValidateNested()
  @Type(() => PutTrainingDto)
  data: PutTrainingDto;
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

export { PutTrainingResponse, PutTrainingRequest };
