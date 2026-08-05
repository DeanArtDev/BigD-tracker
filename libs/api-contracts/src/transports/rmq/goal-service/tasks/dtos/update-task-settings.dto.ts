import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

class TaskSettingsDto {
  @IsString()
  taskId: string;

  @IsBoolean()
  isAllDay: boolean;

  @IsOptional()
  @MaxLength(50)
  @IsString()
  icon?: string;
}

class UpdateTaskSettingsReqData {
  @IsString()
  taskId: string;

  @IsInt()
  userId: number;

  @IsOptional()
  @MaxLength(50)
  @IsString()
  icon?: string | null;

  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;
}

class UpdateTaskSettingsReq {
  @ValidateNested()
  @Type(() => UpdateTaskSettingsReqData)
  data: UpdateTaskSettingsReqData;
}

class UpdateTaskSettingsRes {
  @ValidateNested()
  @Type(() => TaskSettingsDto)
  data: TaskSettingsDto;
}

export { TaskSettingsDto, UpdateTaskSettingsReq, UpdateTaskSettingsRes };
