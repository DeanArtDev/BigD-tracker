import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';

class DeleteTaskReqData {
  @IsString()
  taskId: string;

  @IsInt()
  userId: number;
}

class DeleteTaskReq {
  @ValidateNested()
  @Type(() => DeleteTaskReqData)
  data: DeleteTaskReqData;
}

class DeleteTaskResData {
  @IsString()
  id: string;
}

class DeleteTaskRes {
  @ValidateNested()
  @Type(() => DeleteTaskResData)
  data: DeleteTaskResData;
}

export { DeleteTaskRes, DeleteTaskReq };
