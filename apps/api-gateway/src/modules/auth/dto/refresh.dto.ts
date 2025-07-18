import { Expose, Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class RefreshDto {
  @ApiProperty({ example: 'jwt token is here' })
  @Expose()
  @IsString()
  token: string;
}

class RefreshResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: RefreshDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => RefreshDto)
  data: RefreshDto;
}

export { RefreshResponse };
