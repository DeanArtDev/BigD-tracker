import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean } from 'class-validator';

class FinishTaskRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @IsBoolean()
  data: boolean;
}

export { FinishTaskRes };
