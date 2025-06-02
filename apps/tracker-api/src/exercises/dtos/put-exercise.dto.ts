import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsNullable } from '@shared/decorators/is-nullable';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ExerciseDto } from './exercise.dto';

class PutExerciseData extends OmitType(ExerciseDto, [
  'userId',
  'createdAt',
  'updatedAt',
  'description',
  'exampleUrl',
] as const) {
  @ApiPropertyOptional({
    example: 'свести лопатки',
    nullable: true,
  })
  @IsString()
  @Expose()
  @IsOptional()
  @IsNullable()
  description?: string | null;

  @ApiPropertyOptional({
    example: 'https://youtube.com',
    nullable: true,
  })
  @IsUrl({ protocols: ['https'] })
  @Expose()
  @IsOptional()
  @IsNullable()
  exampleUrl?: string | null;
}

export { PutExerciseData };
