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

class DeleteExerciseReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class DeleteExerciseRes {
  @Expose()
  @ValidateNested()
  @Type(() => ResData)
  data: ResData;
}

export { DeleteExerciseReq, DeleteExerciseRes };
