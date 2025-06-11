import { RepetitionFinishType } from '../../repetitions.repository';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsString, ValidateNested } from 'class-validator';

class FinishRepetitionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiProperty({ example: 1, description: 'Фактическое количество повторений' })
  @IsInt()
  @Expose()
  factCount: number;

  @ApiProperty({ example: '100.7', description: 'Фактический вec' })
  @IsString()
  @Expose()
  factWeight: string;

  @ApiProperty({ example: 1, description: 'Фактический перерыв, значение в секундах' })
  @IsInt()
  @Expose()
  factBreak: number;

  @ApiProperty({ example: 'SKIP', enum: RepetitionFinishType })
  @Type(() => String)
  @IsEnum(RepetitionFinishType)
  @Expose()
  finishType: RepetitionFinishType;
}

class FinishRepetitionsRequestData {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  exerciseId: number;

  @ApiProperty({
    description: 'Ответ сервера',
    type: FinishRepetitionDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinishRepetitionDto)
  repetitions: FinishRepetitionDto[];
}

class FinishRepetitionsRequest {
  @ApiProperty({
    description: 'Ответ сервера',
    type: FinishRepetitionDto,
  })
  @Type(() => FinishRepetitionsRequestData)
  data: FinishRepetitionsRequestData;
}

export { FinishRepetitionsRequest, FinishRepetitionsRequestData, FinishRepetitionDto };
