import { Expose, Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './thing.dto';

class CreateThingReqData {
  @IsString()
  name: string;

  @IsInt()
  userId: number;

  @IsInt()
  @IsOptional()
  groupId?: number;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsInt()
  weight?: number;

  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsString()
  recurrence?: string;
}

class CreateTaskReq {
  @ValidateNested()
  @Type(() => CreateThingReqData)
  data: CreateThingReqData;
}

class CreateTaskRes {
  @Expose()
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { CreateTaskReq, CreateTaskRes };
