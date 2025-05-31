import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';

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
    example: '2025-05-24T13:01:02.471Z',
  })
  @Expose()
  @IsISO8601()
  createdAt: string;
}

export { User };
