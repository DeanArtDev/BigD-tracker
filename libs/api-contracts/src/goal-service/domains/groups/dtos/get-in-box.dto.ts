import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { TaskDto } from '../../tasks/dtos/thing.dto';

class GetInBoxGroupReqData {
  @IsInt()
  userId: number;
}

class GetInBoxGroupReq {
  @ValidateNested()
  @Type(() => GetInBoxGroupReqData)
  data: GetInBoxGroupReqData;
}

class GetInBoxGroupRes {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => TaskDto)
  data: TaskDto[];
}

export { GetInBoxGroupReq, GetInBoxGroupRes };
