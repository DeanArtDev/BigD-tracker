import { Type } from 'class-transformer';
import { IsBoolean, IsInt, ValidateNested } from 'class-validator';

class DeleteGroupReqData {
  @IsInt()
  userId: number;

  @IsInt()
  groupId: number;
}

class DeleteGroupReq {
  @ValidateNested()
  @Type(() => DeleteGroupReqData)
  data: DeleteGroupReqData;
}

class DeleteGroupRes {
  @IsBoolean()
  data: boolean;
}

export { DeleteGroupReq, DeleteGroupRes };
