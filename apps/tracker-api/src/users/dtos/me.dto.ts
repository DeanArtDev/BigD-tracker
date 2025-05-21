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
    example: 'Thu May 15 2025 18:59:22 GMT+0000',
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
