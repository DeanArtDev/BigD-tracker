import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsJWT, IsString, ValidateNested } from 'class-validator';

class ReferralTokenResData {
  @ApiProperty({ example: 'Реферальный токен юзера' })
  @Expose()
  @IsJWT()
  @IsString()
  token: string;
}

class ReferralTokenRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ReferralTokenResData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => ReferralTokenResData)
  data: ReferralTokenResData;
}

export { ReferralTokenRes };
