import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class DeleteTaskReqData {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;
}

class DeleteTaskReq {
  @ValidateNested()
  @Type(() => DeleteTaskReqData)
  data: DeleteTaskReqData;
}

class DeleteTaskResData {
  @IsInt()
  id: number;
}

class DeleteTaskRes {
  @ValidateNested()
  @Type(() => DeleteTaskResData)
  data: DeleteTaskResData;
}

export { DeleteTaskRes, DeleteTaskReq };
