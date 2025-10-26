import { ThingDto } from './thing.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';

class GroupInBoxDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'IN BOX' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'Список дел',
    type: ThingDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ThingDto)
  @IsArray()
  things: ThingDto[];
}

export { GroupInBoxDto };
