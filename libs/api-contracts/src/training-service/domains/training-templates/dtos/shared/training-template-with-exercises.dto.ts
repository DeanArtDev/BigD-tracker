import { ExerciseType } from '../../../exercises';
import { RepetitionDto } from '../../../repetitions';
import { TrainingTemplateDto } from './training-template.dto';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

class Exercise {
  @IsInt()
  @Expose()
  id: number;

  @Expose()
  @Type(() => String)
  @IsEnum(ExerciseType)
  type: ExerciseType;

  @IsString()
  @Expose()
  name: string;

  @IsString()
  @Expose()
  @IsOptional()
  description?: string;

  @IsUrl({ protocols: ['https'] })
  @Expose()
  @IsOptional()
  exampleUrl?: string;

  @Expose()
  @Type(() => RepetitionDto)
  @ValidateNested({ each: true })
  repetitions: RepetitionDto[];
}

class TrainingTemplateWithExercisesDto extends TrainingTemplateDto {
  @Expose()
  @Type(() => Exercise)
  @ValidateNested({ each: true })
  exercises: Exercise[];
}

export { TrainingTemplateWithExercisesDto };
