import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsInt, ValidateNested } from 'class-validator';
import { GroupSettingsDto } from './get-group-settings.dto';

class GetManyGroupSettingsReqData {
  @IsInt()
  userId: number;

  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  groupIds: number[];
}

class GetManyGroupSettingsReq {
  @ValidateNested()
  @Type(() => GetManyGroupSettingsReqData)
  data: GetManyGroupSettingsReqData;
}

class GetManyGroupSettingsRes {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupSettingsDto)
  data: GroupSettingsDto[];
}

export { GetManyGroupSettingsReq, GetManyGroupSettingsRes };
