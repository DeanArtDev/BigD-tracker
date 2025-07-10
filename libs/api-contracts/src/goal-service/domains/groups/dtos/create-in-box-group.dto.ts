import { Expose, Type } from 'class-transformer';
import { IsInt, IsString, MaxLength, ValidateNested } from 'class-validator';

class ReqData {
  @IsInt()
  userId: number;
}

class CreateInBoxGroupReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class ResData {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @Expose()
  @IsInt()
  userId: number;
}

class CreateInBoxGroupRes {
  @Expose()
  @ValidateNested()
  @Type(() => ResData)
  data: ResData;
}

export { CreateInBoxGroupReq, CreateInBoxGroupRes };
