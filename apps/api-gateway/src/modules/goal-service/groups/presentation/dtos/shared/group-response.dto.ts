import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { GroupDto } from './group.dto';
import { ApiProperty } from '@nestjs/swagger';

class GroupRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: GroupDto,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  @IsArray()
  data: GroupDto[];
}

class GroupResSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: GroupDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => GroupDto)
  data: GroupDto;
}

export { GroupRes, GroupResSingle };
