import { PutExerciseTemplateRequestData } from '@/exercises-templates/dtos/put-exercise-template.dto';
import { PutTrainingRequestData } from '@/tranings/dtos/put-training.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class UpdateTrainingAggregationExercise extends PutExerciseTemplateRequestData {}

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
