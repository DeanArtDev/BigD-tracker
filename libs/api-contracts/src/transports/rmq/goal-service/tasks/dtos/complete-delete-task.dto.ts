import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class CompleteDeleteTaskReqData {
  @IsInt()
  userId: number;

  @IsInt()
  taskId: number;
}

class CompleteDeleteTaskReq {
  @ValidateNested()
  @Type(() => CompleteDeleteTaskReqData)
  data: CompleteDeleteTaskReqData;
}

class CompleteDeleteTaskResData {
  @IsInt()
  id: number;
}

class CompleteDeleteTaskRes {
  @ValidateNested()
  @Type(() => CompleteDeleteTaskResData)
  data: CompleteDeleteTaskResData;
}

export { CompleteDeleteTaskReq, CompleteDeleteTaskRes };
