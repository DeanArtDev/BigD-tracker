import { IsBoolean, IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

class RefreshTokenDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'Mazila' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({ example: '10.0.10.5' })
  @IsString()
  @IsOptional()
  ip?: string;

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  revoked: boolean;

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
  })
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  expiresAt: Date;

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
  })
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  createdAt: string;
}

export { RefreshTokenDto };
