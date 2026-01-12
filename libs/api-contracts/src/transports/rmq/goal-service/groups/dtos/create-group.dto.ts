import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { GroupResSingle } from './group-response.dto';

class CreateGroupReqData {
  @IsInt()
  userId: number;

  @MaxLength(255)
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class CreateGroupReq {
  @ValidateNested()
  @Type(() => CreateGroupReqData)
  data: CreateGroupReqData;
}

class CreateGroupRes extends GroupResSingle {}

export { CreateGroupReq, CreateGroupRes };
