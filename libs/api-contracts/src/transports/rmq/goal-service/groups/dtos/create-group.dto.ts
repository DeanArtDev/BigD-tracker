import { GroupStatus } from '../types';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class CreateGroupReqData {
  @IsInt()
  userId: number;

  @MaxLength(255)
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class CreateGroupResData {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  userId: number;

  @IsNumber()
  progress: number;

  @IsNumber()
  weight: number;

  @IsEnum(GroupStatus)
  status: GroupStatus;
}

class CreateGroupReq {
  @ValidateNested()
  @Type(() => CreateGroupReqData)
  data: CreateGroupReqData;
}

class CreateGroupRes {
  @ValidateNested()
  @Type(() => CreateGroupResData)
  data: CreateGroupResData;
}

export { CreateGroupReq, CreateGroupRes };
