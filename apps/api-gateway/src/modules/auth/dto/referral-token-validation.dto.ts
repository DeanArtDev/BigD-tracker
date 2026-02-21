import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsJWT, IsString } from 'class-validator';

class ValidateReferralTokenQuery {
  @ApiProperty({ example: 'Реферальный токен юзера' })
  @Expose()
  @IsJWT()
  @IsString()
  token: string;
}

export { ValidateReferralTokenQuery };
