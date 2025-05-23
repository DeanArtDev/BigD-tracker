import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class RefreshDto {
  @ApiProperty({ example: 'jwt token is here' })
  @IsString()
  token: string;
}

class RefreshResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: RefreshDto,
  })
  data: RefreshDto;
}

export { RefreshResponse };
