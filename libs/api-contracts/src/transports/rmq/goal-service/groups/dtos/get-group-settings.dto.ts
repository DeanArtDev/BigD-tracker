import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, MaxLength, ValidateNested } from 'class-validator';

class GetGroupSettingsReqData {
  @IsInt()
  groupId: number;

  @IsInt()
  userId: number;
}

class GroupSettingsDto {
  @IsInt()
  groupId: number;

  @MaxLength(250)
  @IsString()
  eventColor: string;

  @MaxLength(250)
  @IsString()
  eventSelectedColor: string;

  @MaxLength(250)
  @IsString()
  lineColor: string;

  @MaxLength(250)
  @IsString()
  textColor: string;

  @MaxLength(250)
  @IsString()
  eventColorDark: string;

  @MaxLength(250)
  @IsString()
  eventSelectedColorDark: string;

  @MaxLength(250)
  @IsString()
  lineColorDark: string;

  @MaxLength(250)
  @IsString()
  textColorDark: string;

  @IsBoolean()
  isDefault: boolean;

  @IsBoolean()
  isVisible: boolean;

  @IsBoolean()
  isReadonly: boolean;
}

class GetGroupSettingsReq {
  @ValidateNested()
  @Type(() => GetGroupSettingsReqData)
  data: GetGroupSettingsReqData;
}

class GetGroupSettingsRes {
  @ValidateNested()
  @Type(() => GroupSettingsDto)
  data: GroupSettingsDto;
}

export { GetGroupSettingsReq, GetGroupSettingsRes, GroupSettingsDto };
