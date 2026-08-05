import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { TaskSettingsDto } from './update-task-settings.dto';

class GetTaskSettingsReqData {
  @IsInt()
  userId: number;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  taskIds: string[];
}

class GetTaskSettingsReq {
  @ValidateNested()
  @Type(() => GetTaskSettingsReqData)
  data: GetTaskSettingsReqData;
}

class GetTaskSettingsRes {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskSettingsDto)
  data: TaskSettingsDto[];
}

export { GetTaskSettingsReq, GetTaskSettingsRes };
