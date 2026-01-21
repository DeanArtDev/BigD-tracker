import { TaskDto } from './task.dto';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsISO8601, IsString, ValidateNested } from 'class-validator';

class GetDiaryTasksReqData {
  @IsInt()
  userId: number;

  @IsISO8601()
  @IsString()
  from: string;

  @IsISO8601()
  @IsString()
  to: string;
}

class GetDiaryTasksReq {
  @Type(() => GetDiaryTasksReqData)
  @ValidateNested()
  data: GetDiaryTasksReqData;
}

class GetDiaryTasksRes {
  @Type(() => TaskDto)
  @ValidateNested({ each: true })
  @IsArray()
  data: TaskDto[];
}

export { GetDiaryTasksReq, GetDiaryTasksRes };
