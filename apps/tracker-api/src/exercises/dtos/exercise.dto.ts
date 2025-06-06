import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, IsUrl } from 'class-validator';
import { ExerciseType } from '../entity/exercise-template.entity';

class ExerciseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  userId: number;

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
  })
  @IsString()
  @Expose()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://youtube.com',
  })
  @IsUrl({ protocols: ['https'] })
  @Expose()
  @IsOptional()
  exampleUrl?: string;

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @Expose()
  @IsISO8601()
  createdAt: string;

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @IsISO8601()
  @Expose()
  updatedAt: string;
}

export { ExerciseDto };
