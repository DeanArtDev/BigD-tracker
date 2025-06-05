import { TrainingTemplateDto } from '@/tranings/dtos/training-template.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

class UpdateTrainingTemplatesAggregationExercise {
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

class UpdateTrainingTemplateAggregationRequestData extends OmitType(TrainingTemplateDto, [
  'userId',
  'createdAt',
  'updatedAt',
] as const) {
  @ApiProperty({
    type: UpdateTrainingTemplatesAggregationExercise,
    isArray: true,
  })
  @IsArray()
  @Type(() => UpdateTrainingTemplatesAggregationExercise)
  @ValidateNested({ each: true })
  exercises: UpdateTrainingTemplatesAggregationExercise[];
}

class UpdateTrainingTemplateAggregationRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: UpdateTrainingTemplateAggregationRequestData,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTrainingTemplateAggregationRequestData)
  data: UpdateTrainingTemplateAggregationRequestData[];
}

export {
  UpdateTrainingTemplateAggregationRequest,
  UpdateTrainingTemplatesAggregationExercise,
  UpdateTrainingTemplateAggregationRequestData,
};

