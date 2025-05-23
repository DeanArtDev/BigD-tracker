import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TrainingDto } from './training.dto';

class GetTrainingsDto {
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

export { GetTrainingsDto };
