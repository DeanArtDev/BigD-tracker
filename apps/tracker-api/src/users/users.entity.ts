import { IsInt, IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
}

export { User };
