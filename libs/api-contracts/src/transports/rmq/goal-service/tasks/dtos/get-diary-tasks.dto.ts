import { Type } from 'class-transformer';
import { IsArray, IsInt, IsISO8601, IsOptional, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class GetDiaryTasksFilterDto {
  @IsISO8601()
  from: string;

  @IsISO8601()
  to: string;

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  group?: number[];
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
  @Type(() => TaskDto)
  @ValidateNested({ each: true })
  @IsArray()
  items: TaskDto[];
}

class GetDiaryTasksRes {
  @ValidateNested({ each: true })
  @Type(() => GetDiaryTasksResData)
  data: GetDiaryTasksResData;
}

export { GetDiaryTasksReq, GetDiaryTasksRes };
