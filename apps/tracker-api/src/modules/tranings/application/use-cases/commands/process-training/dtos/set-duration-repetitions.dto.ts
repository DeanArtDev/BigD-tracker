import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class SetBreakRequestData {
  @ApiProperty({ example: 1, description: 'Фактический перерыв, значение в секундах' })
  @IsInt()
  @Expose()
  factBreak: number;
}

class SetRepetitionBreakRequest {
  @ApiProperty({
    description: 'Ответ сервера',
    type: SetBreakRequestData,
  })
  @ValidateNested()
  @Type(() => SetBreakRequestData)
  data: SetBreakRequestData;
}

export { SetRepetitionBreakRequest, SetBreakRequestData };
