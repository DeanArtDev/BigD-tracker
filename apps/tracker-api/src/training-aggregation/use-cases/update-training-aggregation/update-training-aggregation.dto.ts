import { ExerciseTemplateDto } from '@/exercises-templates/dtos/exercise-template.dto';
import { UpdateRepetitionsDto } from '@/repetitions/dto/update-repetitions.dto';
import { PutTrainingRequestData } from '@/tranings/dtos/put-training.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class UpdateTrainingAggregationExercise extends OmitType(ExerciseTemplateDto, [
  'userId',
  'createdAt',
  'updatedAt',
  'repetitions',
] as const) {
  @ApiProperty({
    description: 'Повторения',
    type: UpdateRepetitionsDto,
    isArray: true,
  })
  @Expose()
  @IsArray()
  @Type(() => UpdateRepetitionsDto)
  @ValidateNested({ each: true })
  repetitions: UpdateRepetitionsDto[];
}

class UpdateTrainingAggregationRequestData extends PutTrainingRequestData {
  @ApiProperty({
    type: UpdateTrainingAggregationExercise,
    isArray: true,
  })
  @IsArray()
  @Type(() => UpdateTrainingAggregationExercise)
  @ValidateNested({ each: true })
  exercises: UpdateTrainingAggregationExercise[];
}

class UpdateTrainingAggregationRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: UpdateTrainingAggregationRequestData,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateTrainingAggregationRequestData)
  data: UpdateTrainingAggregationRequestData[];
}

export {
  UpdateTrainingAggregationRequest,
  UpdateTrainingAggregationRequestData,
  UpdateTrainingAggregationExercise,
};
