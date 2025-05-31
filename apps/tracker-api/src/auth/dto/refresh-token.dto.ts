import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';

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
    description: 'ISO String',
  })
  @Expose()
  @IsISO8601()
  expiresAt: string;

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @Expose()
  @IsISO8601()
  createdAt: string;
}

export { RefreshTokenDto };
