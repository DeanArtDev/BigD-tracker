import { CreateRepetitionsDto } from '@/repetitions/dto/create-repetitions.dto';
import { CreateTrainingRequestData } from '@/tranings/dtos/create-training.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

class CreateTrainingAggregationExercise {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiProperty({ type: CreateRepetitionsDto, isArray: true })
  @IsArray()
  @Expose()
  @Type(() => CreateRepetitionsDto)
  @ValidateNested({ each: true })
  repetitions: CreateRepetitionsDto[];
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
  })
  @ValidateNested()
  @Type(() => CreateTrainingAggregationRequestData)
  data: CreateTrainingAggregationRequestData;
}

export {
  CreateTrainingAggregationRequest,
  CreateTrainingAggregationRequestData,
  CreateTrainingAggregationExercise,
};
