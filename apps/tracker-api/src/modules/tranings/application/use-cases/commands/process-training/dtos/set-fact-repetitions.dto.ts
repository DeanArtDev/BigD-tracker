import { RepetitionFinishType } from '@/modules/repetitions';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, ValidateNested } from 'class-validator';

class FactRepetitionDto {
  @ApiProperty({ example: 1, description: 'Фактическое количество повторений' })
  @IsInt()
  @Expose()
  factCount: number;

  @ApiProperty({ example: '100.7', description: 'Фактический вec' })
  @IsString()
  @Expose()
  factWeight: string;

  @ApiProperty({ example: 'SKIP', enum: RepetitionFinishType })
  @Type(() => String)
  @IsEnum(RepetitionFinishType)
  @Expose()
  finishType: RepetitionFinishType;
}

class SetRepetitionFactRequest {
  @ApiProperty({
    description: 'Ответ сервера',
    type: FactRepetitionDto,
  })
  @ValidateNested()
  @Type(() => FactRepetitionDto)
  data: FactRepetitionDto;
}

export { SetRepetitionFactRequest, FactRepetitionDto };
