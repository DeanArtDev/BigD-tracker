import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';

class AssignTaskToInboxReqData {
  @IsInt()
  userId: number;

  @IsString()
  taskId: string;
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
