import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';

class AssignTaskToGroupReqData {
  @IsInt()
  userId: number;

  @IsInt()
  groupId: number;

  @IsString()
  taskId: string;
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
