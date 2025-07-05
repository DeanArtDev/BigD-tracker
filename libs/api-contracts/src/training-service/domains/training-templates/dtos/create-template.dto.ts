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
import { ExerciseType } from '../../exercises';
import { RepetitionFinishType } from '../../repetitions';
import { TrainingType } from '../../trainings';
import { TrainingTemplateWithExercisesResSingle } from './shared/training-templates-response.dto';

class Repetition {
  @IsString()
  @Expose()
  @IsOptional()
  description?: string;

  @Type(() => String)
  @IsEnum(RepetitionFinishType)
  @IsOptional()
  @Expose()
  finishType?: RepetitionFinishType;

  @IsInt()
  @Expose()
  targetCount: number;

  @IsString()
  @Expose()
  targetWeight: string;

  @IsInt()
  @Expose()
  targetBreak: number;
}

class Exercise {
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
  @Type(() => Repetition)
  @IsArray()
  repetitions: Repetition[];
}

class ReqData {
  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @Type(() => String)
  @IsEnum(TrainingType)
  type: TrainingType;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsInt()
  wormUpDuration?: number;

  @Expose()
  @IsOptional()
  @IsInt()
  postTrainingDuration?: number;

  @IsArray()
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => Exercise)
  exercises: Exercise[];
}

class CreateTemplateReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class CreateTemplateRes extends TrainingTemplateWithExercisesResSingle {}

export { CreateTemplateReq, CreateTemplateRes };
