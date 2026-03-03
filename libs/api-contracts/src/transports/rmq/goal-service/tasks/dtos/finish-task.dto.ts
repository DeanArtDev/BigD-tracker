import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';

class FinishFinishReqData {
  @IsInt()
  userId: number;

  @IsString()
  taskId: string;
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
