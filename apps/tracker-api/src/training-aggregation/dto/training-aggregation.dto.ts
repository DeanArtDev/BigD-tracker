import { ExerciseTemplateDto } from '@/exercises/dtos/exercise-template.dto';
import { TrainingDto } from '@/tranings/dtos/training.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class TrainingAggregationDto extends TrainingDto {
  @ApiProperty({
    type: ExerciseTemplateDto,
    isArray: true,
  })
  @Expose()
  @IsArray()
  @Type(() => ExerciseTemplateDto)
  @ValidateNested({ each: true })
  exercises: ExerciseTemplateDto[];
}

export { TrainingAggregationDto };
