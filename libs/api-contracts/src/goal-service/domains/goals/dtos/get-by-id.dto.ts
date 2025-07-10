import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { GoalResSingle } from './shared/goal-response.dto';

class ReqData {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;
}

class GetGoalByIdReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class GetGoalByIdRes extends GoalResSingle {}

export { GetGoalByIdReq, GetGoalByIdRes };
