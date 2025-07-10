import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { GroupDto } from './group.dto';

class GroupRes {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  data: GroupDto[];
}

class GroupResSingle {
  @Expose()
  @ValidateNested()
  @Type(() => GroupDto)
  data: GroupDto;
}

export { GroupRes, GroupResSingle };
