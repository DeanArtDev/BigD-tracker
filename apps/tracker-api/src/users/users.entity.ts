import { IsDate, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

/* Это блэт DTO а не entity!*/
class User {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  @IsString()
  @IsOptional()
  screenName?: string;

  @ApiProperty({ example: 'john@example.com' })
  @Expose()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '/some-hash.png' })
  @Expose()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    example: 'Thu May 15 2025 18:59:22 GMT+0000',
  })
  @Expose()
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  createdAt: Date;
}

export { User };
