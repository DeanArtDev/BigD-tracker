import { TaskDto } from '@transports/rmq/goal-service/tasks/dtos';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';

class GetInBoxGroupReqData {
  @IsInt()
  userId: number;
}

class GetInBoxGroupReq {
  @ValidateNested()
  @Type(() => GetInBoxGroupReqData)
  data: GetInBoxGroupReqData;
}

class GetInBoxGroupResData {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => TaskDto)
  tasks: TaskDto[];
}

class GetInBoxGroupRes {
  @ValidateNested()
  @Type(() => GetInBoxGroupResData)
  data: GetInBoxGroupResData;
}

export { GetInBoxGroupReq, GetInBoxGroupRes };
