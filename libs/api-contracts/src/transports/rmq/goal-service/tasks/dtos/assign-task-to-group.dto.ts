import { Type } from 'class-transformer';
import { IsBoolean, IsInt, ValidateNested } from 'class-validator';

class AssignTaskToGroupReqData {
  @IsInt()
  userId: number;

  @IsInt()
  groupId: number;

  @IsInt()
  taskId: number;
}

class AssignTaskToGroupReq {
  @ValidateNested()
  @Type(() => AssignTaskToGroupReqData)
  data: AssignTaskToGroupReqData;
}

class AssignTaskToGroupResData {
  @IsBoolean()
  success: boolean;
}

class AssignTaskToGroupRes {
  @ValidateNested()
  @Type(() => AssignTaskToGroupResData)
  data: AssignTaskToGroupResData;
}

export { AssignTaskToGroupReq, AssignTaskToGroupRes };
