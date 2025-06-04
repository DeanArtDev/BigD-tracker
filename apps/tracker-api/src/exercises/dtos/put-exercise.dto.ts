import { ExerciseType } from '@/exercises/entity/exercise.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNullable } from '@shared/decorators/is-nullable';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

class PutExerciseData {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  trainingId: number;

  @ApiProperty({ example: 'ANAEROBIC', enum: ExerciseType })
  @Type(() => String)
  @IsEnum(ExerciseType)
  @Expose()
  type: ExerciseType;

  @ApiProperty({
    example: 'Жим лежа',
  })
  @IsString()
  @Expose()
  name: string;

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
