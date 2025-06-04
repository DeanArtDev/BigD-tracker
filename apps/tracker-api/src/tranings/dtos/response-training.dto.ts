import { TrainingDto } from '@/tranings/dtos/training.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class TrainingResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => TrainingDto)
  data: TrainingDto[];
}

export { TrainingResponse };
