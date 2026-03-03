import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';

class UnassignTaskFromGroupReqData {
  @IsInt()
  userId: number;

  @IsInt()
  groupId: number;

  @IsString()
  taskId: string;
}

class UnassignTaskFromGroupReq {
  @ValidateNested()
  @Type(() => UnassignTaskFromGroupReqData)
  data: UnassignTaskFromGroupReqData;
}

class UnassignTaskFromGroupResData {
  @IsBoolean()
  success: boolean;
}

class UnassignTaskFromGroupRes {
  @ValidateNested()
  @Type(() => UnassignTaskFromGroupResData)
  data: UnassignTaskFromGroupResData;
}

export { UnassignTaskFromGroupReq, UnassignTaskFromGroupRes };
