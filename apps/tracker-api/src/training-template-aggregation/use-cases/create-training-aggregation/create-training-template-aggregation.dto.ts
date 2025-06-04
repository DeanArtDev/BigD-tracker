import { TrainingTemplateDto } from '@/tranings/dtos/training-template.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

class CreateTrainingTemplatesAggregationExercise {
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

class CreateTrainingTemplateAggregationRequestData extends OmitType(TrainingTemplateDto, [
  'id',
  'createdAt',
  'updatedAt',
] as const) {
  @ApiProperty({
    type: CreateTrainingTemplatesAggregationExercise,
    isArray: true,
  })
  @IsArray()
  @Type(() => CreateTrainingTemplatesAggregationExercise)
  @ValidateNested({ each: true })
  exercises: CreateTrainingTemplatesAggregationExercise[];
}

class CreateTrainingTemplateAggregationRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateTrainingTemplateAggregationRequestData,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateTrainingTemplateAggregationRequestData)
  data: CreateTrainingTemplateAggregationRequestData[];
}

export {
  CreateTrainingTemplateAggregationRequest,
  CreateTrainingTemplatesAggregationExercise,
  CreateTrainingTemplateAggregationRequestData,
};
