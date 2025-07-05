import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsISO8601, ValidateNested } from 'class-validator';

class Item {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsISO8601()
  startDate: string;
}

class ReqData {
  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => Item)
  @IsArray()
  items: Item[];
}

class AssignTrainingsReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class AssignTrainingsRes {
  @Expose()
  @IsBoolean()
  data: boolean;
}

export { AssignTrainingsReq, AssignTrainingsRes };
