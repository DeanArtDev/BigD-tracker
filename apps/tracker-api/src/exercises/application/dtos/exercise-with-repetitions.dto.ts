import { RepetitionDto } from '@/repetitions';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ExerciseDto } from './exercise.dto';

class ExerciseWithRepetitionsDto extends ExerciseDto {
  @ApiProperty({
    description: 'Повторения',
    type: RepetitionDto,
    isArray: true,
  })
  @Expose()
  @Type(() => RepetitionDto)
  @ValidateNested({ each: true })
  repetitions: RepetitionDto[];
}

export { ExerciseWithRepetitionsDto };
