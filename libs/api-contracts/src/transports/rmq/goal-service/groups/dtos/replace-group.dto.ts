import { TaskRecurrencyDto } from '@/transports/rmq/goal-service/tasks/dtos';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { GroupResSingle } from './group-response.dto';

class ReplaceGroupTask {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  priority: number;

  @IsNumber()
  weight: number;

  @IsOptional()
  @IsObject()
  @Type(() => TaskRecurrencyDto)
  recurrence?: TaskRecurrencyDto;
}

class ReplaceGroupReqData {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;

  @MaxLength(255)
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ReplaceGroupTask)
  tasks: ReplaceGroupTask[];
}

class ReplaceGroupReq {
  @ValidateNested()
  @Type(() => ReplaceGroupReqData)
  data: ReplaceGroupReqData;
}

class ReplaceGroupRes extends GroupResSingle {}

export { ReplaceGroupReq, ReplaceGroupRes };
