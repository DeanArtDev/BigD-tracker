import { ExerciseTemplateDto } from '@/exercises/dtos/exercise-template.dto';
import { TrainingTemplateDto } from '@/tranings/dtos/training-template.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class TrainingTemplateAggregationDto extends TrainingTemplateDto {
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

export { TrainingTemplateAggregationDto };
