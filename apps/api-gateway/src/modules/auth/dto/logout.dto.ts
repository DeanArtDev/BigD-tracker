import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

class LogoutResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: Boolean,
  })
  @Expose()
  data: boolean;
}

export { LogoutResponse };
