import { Type } from 'class-transformer';
import { IsBoolean, IsInt, ValidateNested } from 'class-validator';

class AssignTaskToInboxReqData {
  @IsInt()
  userId: number;

  @IsInt()
  taskId: number;
}

class AssignTaskToInboxReq {
  @ValidateNested()
  @Type(() => AssignTaskToInboxReqData)
  data: AssignTaskToInboxReqData;
}

class AssignTaskToInboxResData {
  @IsBoolean()
  success: boolean;
}

class AssignTaskToInboxRes {
  @ValidateNested()
  @Type(() => AssignTaskToInboxResData)
  data: AssignTaskToInboxResData;
}

export { AssignTaskToInboxReq, AssignTaskToInboxRes };
