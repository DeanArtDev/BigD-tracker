import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { GroupResSingle } from './group-response.dto';

class ReplaceGroupTask {
  @IsString()
  id: string;
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
  @IsOptional()
  @IsArray()
  @Type(() => ReplaceGroupTask)
  tasks?: ReplaceGroupTask[];
}

class ReplaceGroupReq {
  @ValidateNested()
  @Type(() => ReplaceGroupReqData)
  data: ReplaceGroupReqData;
}

class ReplaceGroupRes extends GroupResSingle {}

export { ReplaceGroupReq, ReplaceGroupRes };
