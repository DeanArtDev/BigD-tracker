import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsBooleanString } from '@shared/decorators/is-boolean-string';
import { Expose, Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ExerciseTemplateDto } from './exercise-template.dto';

class CreateExerciseTemplateDto extends OmitType(ExerciseTemplateDto, [
  'id',
  'createdAt',
] as const) {}

class GetExerciseTemplatesQuery {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Expose()
  @IsBooleanString()
  my?: boolean;
}

class CreateExerciseTemplateRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateExerciseTemplateDto,
  })
  @ValidateNested()
  @Type(() => CreateExerciseTemplateDto)
  data: CreateExerciseTemplateDto;
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

export { CreateExerciseTemplateRequest, CreateExerciseTemplateResponse, GetExerciseTemplatesQuery };
