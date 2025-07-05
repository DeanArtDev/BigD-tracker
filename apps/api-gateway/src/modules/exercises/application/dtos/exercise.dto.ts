import { ExerciseType } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

class ExerciseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Expose()
  @IsOptional()
  userId?: number;

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

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Expose()
  @IsOptional()
  trainingId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Expose()
  @IsOptional()
  templateId?: number;
}

export { ExerciseDto };
