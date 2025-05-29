import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, IsUrl } from 'class-validator';

enum ExerciseType {
  'WORM-UP' = 'WORM-UP',
  'POST-TRAINING' = 'POST-TRAINING',
  'AEROBIC' = 'AEROBIC',
  'ANAEROBIC' = 'ANAEROBIC',
}

class ExerciseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  userId: number;

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
}

export { ExerciseDto, ExerciseType };
