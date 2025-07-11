import { TrainingDto } from './training.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class TrainingResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TrainingDto)
  @IsArray()
  data: TrainingDto[];
}

class TrainingResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => TrainingDto)
  data: TrainingDto;
}

export { TrainingResponseSingle, TrainingResponse };
