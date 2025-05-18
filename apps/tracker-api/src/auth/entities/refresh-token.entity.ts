import { IsBoolean, IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class RefreshToken {
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
    example: 'Thu May 15 2025 18:59:22 GMT+0000',
  })
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  expiresAt: Date;

  @ApiProperty({
    example: 'Thu May 15 2025 18:59:22 GMT+0000',
  })
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  createdAt: string;
}
