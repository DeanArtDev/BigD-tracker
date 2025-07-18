import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean } from 'class-validator';

class LogoutResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: Boolean,
  })
  @Expose()
  @IsBoolean()
  data: boolean;
}

export { LogoutResponse };
