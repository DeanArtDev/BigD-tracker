import { Type } from 'class-transformer';
import { IsBoolean, IsInt, ValidateNested } from 'class-validator';

class FinishFinishReqData {
  @IsInt()
  userId: number;

  @IsInt()
  taskId: number;
}

class FinishTaskReq {
  @ValidateNested()
  @Type(() => FinishFinishReqData)
  data: FinishFinishReqData;
}

class FinishTaskRes {
  @IsBoolean()
  data: boolean;
}

export { FinishTaskReq, FinishTaskRes };
