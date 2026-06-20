import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { GroupStatus } from '../types';

class GroupDto {
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

  @IsEnum(GroupStatus)
  status: GroupStatus;
}

export { GroupDto };
