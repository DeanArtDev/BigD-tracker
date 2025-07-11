import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ExerciseType } from '../../../exercises';
import { RepetitionDto } from '../../../repetitions';
import { TrainingDto } from './training.dto';

class Exercise {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsEnum(ExerciseType)
  @Type(() => String)
  type: ExerciseType;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsUrl({ protocols: ['https'] })
  @IsOptional()
  @IsString()
  exampleUrl?: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => RepetitionDto)
  repetitions: RepetitionDto[];
}

class TrainingWithExercisesDto extends TrainingDto {
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => Exercise)
  @IsArray()
  exercises: Exercise[];
}

export { TrainingWithExercisesDto };
