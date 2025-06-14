import { TrainingDto } from './training.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class TrainingResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingDto)
  data: TrainingDto[];
}

class TrainingResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingDto,
  })
  @Type(() => TrainingDto)
  data: TrainingDto;
}

export { TrainingResponseSingle, TrainingResponse };
