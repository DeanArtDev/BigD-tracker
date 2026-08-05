import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { GroupSettingsDto } from './get-group-settings.dto';

class UpdateGroupSettingsReqData {
  @IsInt()
  groupId: number;

  @IsInt()
  userId: number;

  @IsOptional()
  @MaxLength(250)
  @IsString()
  eventColor?: string;

  @IsOptional()
  @MaxLength(250)
  @IsString()
  eventSelectedColor?: string;

  @IsOptional()
  @MaxLength(250)
  @IsString()
  lineColor?: string;

  @IsOptional()
  @MaxLength(250)
  @IsString()
  textColor?: string;

  @IsOptional()
  @MaxLength(250)
  @IsString()
  eventColorDark?: string;

  @IsOptional()
  @MaxLength(250)
  @IsString()
  eventSelectedColorDark?: string;

  @IsOptional()
  @MaxLength(250)
  @IsString()
  lineColorDark?: string;

  @IsOptional()
  @MaxLength(250)
  @IsString()
  textColorDark?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isReadonly?: boolean;
}

class UpdateGroupSettingsReq {
  @ValidateNested()
  @Type(() => UpdateGroupSettingsReqData)
  data: UpdateGroupSettingsReqData;
}

class UpdateGroupSettingsRes {
  @ValidateNested()
  @Type(() => GroupSettingsDto)
  data: GroupSettingsDto;
}

export { UpdateGroupSettingsReq, UpdateGroupSettingsRes };
