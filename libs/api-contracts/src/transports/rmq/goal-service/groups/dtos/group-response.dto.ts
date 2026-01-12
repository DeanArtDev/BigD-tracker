import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { GroupDto } from './group.dto';

class GroupResSingle {
  @ValidateNested()
  @Type(() => GroupDto)
  data: GroupDto;
}

export { GroupResSingle };
