import { CreateRepetitionsDto } from '@/repetitions/dto/create-repetitions.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ExerciseTemplateDto } from './exercise-template.dto';

class CreateExerciseTemplateRequestData extends OmitType(ExerciseTemplateDto, [
  'id',
  'createdAt',
  'updatedAt',
  'userId',
  'repetitions',
] as const) {
  @ApiProperty({
    description: 'Повторения',
    type: CreateRepetitionsDto,
    isArray: true,
  })
  @Expose()
  @IsArray()
  @Type(() => CreateRepetitionsDto)
  @ValidateNested({ each: true })
  repetitions: CreateRepetitionsDto[];
}

class CreateExerciseTemplateRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateExerciseTemplateRequestData,
  })
  @ValidateNested()
  @Type(() => CreateExerciseTemplateRequestData)
  data: CreateExerciseTemplateRequestData;
}

class CreateExerciseTemplateResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseTemplateDto,
  })
  @ValidateNested()
  @Type(() => ExerciseTemplateDto)
  data: ExerciseTemplateDto;
}

export {
  CreateExerciseTemplateRequest,
  CreateExerciseTemplateResponse,
  CreateExerciseTemplateRequestData,
};
