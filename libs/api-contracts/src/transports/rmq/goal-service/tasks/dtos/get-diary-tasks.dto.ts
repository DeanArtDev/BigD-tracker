import { Type } from 'class-transformer';
import { IsArray, IsInt, IsISO8601, ValidateNested } from 'class-validator';
import { TaskVirtualDto } from './task-virtual.dto';

class GetDiaryTasksFilterDto {
  @IsISO8601()
  from: string;

  @IsISO8601()
  to: string;
}

class GetDiaryTasksReqData {
  @IsInt()
  userId: number;

  @ValidateNested()
  @Type(() => GetDiaryTasksFilterDto)
  filter: GetDiaryTasksFilterDto;
}

class GetDiaryTasksReq {
  @Type(() => GetDiaryTasksReqData)
  @ValidateNested({ each: true })
  data: GetDiaryTasksReqData;
}

class GetDiaryTasksResData {
  @Type(() => TaskVirtualDto)
  @ValidateNested({ each: true })
  @IsArray()
  items: TaskVirtualDto[];
}

class GetDiaryTasksRes {
  @ValidateNested({ each: true })
  @Type(() => GetDiaryTasksResData)
  data: GetDiaryTasksResData;
}

export { GetDiaryTasksReq, GetDiaryTasksRes };
