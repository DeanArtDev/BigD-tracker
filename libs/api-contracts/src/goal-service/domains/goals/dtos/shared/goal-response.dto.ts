import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { GoalDto } from './goal.dto';

class GoalRes {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoalDto)
  data: GoalDto[];
}

class GoalResSingle {
  @Expose()
  @ValidateNested()
  @Type(() => GoalDto)
  data: GoalDto;
}

export { GoalRes, GoalResSingle };
