import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class ReqData {
  @IsInt()
  @Expose()
  id: number;

  @IsInt()
  @Expose()
  userId: number;
}

class ResData {
  @IsInt()
  @Expose()
  id: number;
}

class DeleteTemplateReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class DeleteTemplateRes {
  @Expose()
  @ValidateNested()
  @Type(() => ResData)
  data: ResData;
}

export { DeleteTemplateReq, DeleteTemplateRes };
