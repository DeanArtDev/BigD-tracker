import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

class UserDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiPropertyOptional({ example: 'Твой повелитель' })
  @IsString()
  @IsOptional()
  @Expose()
  screenName?: string;

  @IsEmail()
  @Expose()
  @ApiProperty({ example: 'test@email.com' })
  email: string;

  @ApiPropertyOptional({ example: '/some-hash.png' })
  @Expose()
  @IsOptional()
  @IsString()
  avatar?: string;
}

export { UserDto };
