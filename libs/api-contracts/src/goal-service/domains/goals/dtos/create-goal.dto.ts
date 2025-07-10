import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { GoalResSingle } from './shared/goal-response.dto';

class ReqData {
  @IsInt()
  userId: number;

  @MaxLength(255)
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class CreateGoalReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class CreateGoalRes extends GoalResSingle {}

export { CreateGoalReq, CreateGoalRes };
