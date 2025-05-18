import { ApiProperty } from '@nestjs/swagger';

class LogoutResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: Boolean,
  })
  data: boolean;
}

export { LogoutResponse };
