import { CreateTrainingRequestData } from '@/tranings/dtos/create-training.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

class CreateTrainingAggregationExercise {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Expose()
  sets: number;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Expose()
  repetitions: number;
}

class CreateTrainingAggregationRequestData extends CreateTrainingRequestData {
  @ApiProperty({
    type: CreateTrainingAggregationExercise,
    isArray: true,
  })
  @IsArray()
  @Type(() => CreateTrainingAggregationExercise)
  @ValidateNested({ each: true })
  exercises: CreateTrainingAggregationExercise[];
}

class CreateTrainingAggregationRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateTrainingAggregationRequestData,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateTrainingAggregationRequestData)
  data: CreateTrainingAggregationRequestData[];
}

export {
  CreateTrainingAggregationRequest,
  CreateTrainingAggregationRequestData,
  CreateTrainingAggregationExercise,
};
