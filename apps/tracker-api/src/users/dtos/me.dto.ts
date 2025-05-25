import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
  })
  @Expose()
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  createdAt: Date;

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
