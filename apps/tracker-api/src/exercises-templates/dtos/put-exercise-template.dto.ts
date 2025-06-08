import { UpdateRepetitionsDto } from '@/repetitions/dto/update-repetitions.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ExerciseTemplateDto } from './exercise-template.dto';

class PutExerciseTemplateRequestData extends OmitType(ExerciseTemplateDto, [
  'id',
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

class PutExerciseTemplateRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PutExerciseTemplateRequestData,
  })
  @ValidateNested()
  @Type(() => PutExerciseTemplateRequestData)
  data: PutExerciseTemplateRequestData;
}

export { PutExerciseTemplateRequest, PutExerciseTemplateRequestData };
