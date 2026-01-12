import { Type } from 'class-transformer';
import { IsBoolean, IsInt, ValidateNested } from 'class-validator';

class UnassignTaskFromGroupReqData {
  @IsInt()
  userId: number;

  @IsInt()
  groupId: number;

  @IsInt()
  taskId: number;
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
