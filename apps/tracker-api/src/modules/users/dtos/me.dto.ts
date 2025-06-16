import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

class MeDto {
  @IsInt()
  @Expose()
  @ApiProperty()
  id: number;

  @IsString()
  @Expose()
  @IsOptional()
  @ApiPropertyOptional()
  screenName?: string;

  @IsEmail()
  @Expose()
  @ApiProperty()
  email: string;

  @IsUrl()
  @ApiPropertyOptional({ example: '/some-hash.png' })
  @Expose()
  @IsOptional()
  @IsString()
  avatar?: string;

  @IsArray()
  @IsString({ each: true })
  @Expose()
  @ApiPropertyOptional({ example: ['admin', 'user', 'moderator'] })
  roles: string[];

  @ApiPropertyOptional({
    example: '2025-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @Expose()
  @IsISO8601()
  createdAt: string;

  @Expose()
  @ApiProperty()
  @IsBoolean()
  isVerified: boolean;
}

class MeDtoResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: MeDto,
  })
  data: MeDto;
}

export { MeDto, MeDtoResponse };
