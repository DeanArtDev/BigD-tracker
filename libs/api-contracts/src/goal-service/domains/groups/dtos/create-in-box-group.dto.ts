import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength, ValidateNested } from 'class-validator';

class CreateInboxGroupReqData {
  @IsInt()
  userId: number;
}

class CreateInboxGroupReq {
  @ValidateNested()
  @Type(() => CreateInboxGroupReqData)
  data: CreateInboxGroupReqData;
}

class CreateInboxGroupResData {
  @IsInt()
  id: number;

  @MaxLength(255)
  @IsString()
  name: string;

  @IsInt()
  userId: number;
}

class CreateInboxGroupRes {
  @ValidateNested()
  @Type(() => CreateInboxGroupResData)
  data: CreateInboxGroupResData;
}

export { CreateInboxGroupReq, CreateInboxGroupRes };
