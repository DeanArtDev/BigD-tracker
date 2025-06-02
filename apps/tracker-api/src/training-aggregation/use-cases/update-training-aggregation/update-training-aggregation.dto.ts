import { PutExerciseData } from '@/exercises/dtos/put-exercise.dto';
import { PutTrainingRequestData } from '@/tranings/dtos/put-training.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TrainingAggregationDto } from '../../dto/training-aggregation.dto';

class UpdateTrainingAggregationExercise extends PutExerciseData {}

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

class UpdateTrainingAggregationResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingAggregationDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => TrainingAggregationDto)
  data: TrainingAggregationDto[];
}

export {
  UpdateTrainingAggregationRequest,
  UpdateTrainingAggregationResponse,
  UpdateTrainingAggregationRequestData,
  UpdateTrainingAggregationExercise,
};
