import { ExerciseDto } from '@/exercises/dtos/exercise.dto';
import { TrainingDto } from '@/tranings/dtos/training.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class TrainingAggregationDto extends TrainingDto {
  @ApiProperty({
    type: ExerciseDto,
    isArray: true,
  })
  @Expose()
  @IsArray()
  @Type(() => ExerciseDto)
  @ValidateNested({ each: true })
  exercises: ExerciseDto[];
}

export { TrainingAggregationDto };
