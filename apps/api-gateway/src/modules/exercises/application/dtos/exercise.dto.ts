import { ExerciseType } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

class ExerciseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ example: 'ANAEROBIC', enum: ExerciseType })
  @Expose()
  @Type(() => String)
  @IsEnum(ExerciseType)
  type: ExerciseType;

  @ApiProperty({
    example: 'Жим лежа',
  })
  @Expose()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'свести лопатки',
  })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://youtube.com',
  })
  @IsUrl({ protocols: ['https'] })
  @IsOptional()
  @Expose()
  @IsString()
  exampleUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsOptional()
  @IsInt()
  trainingId?: number;

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsOptional()
  @IsInt()
  templateId?: number;
}

export { ExerciseDto };
