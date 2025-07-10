import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { GoalRes } from './shared/goal-response.dto';

class ReqData {
  @IsInt()
  userId: number;
}

class GetGoalByUserIdReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class GetGoalByUserIdRes extends GoalRes {}

export { GetGoalByUserIdRes, GetGoalByUserIdReq };
