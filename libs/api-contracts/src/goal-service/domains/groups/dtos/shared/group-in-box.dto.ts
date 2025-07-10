import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ThingDto } from '../../../things';

class GroupInBoxDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ThingDto)
  @IsArray()
  things: ThingDto[];
}

export { GroupInBoxDto };
