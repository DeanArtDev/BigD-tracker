import { CursorPaginationQueryDto } from '@/transports/rmq/shared/dto';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { GroupDto } from './group.dto';

class GetUserGroupsReqData extends CursorPaginationQueryDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => String)
  @IsArray()
  sort?: string[];

  @IsOptional()
  @Type(() => String)
  @IsArray()
  filter?: string[];
}

class GetUserGroupsReq {
  @ValidateNested()
  @Type(() => GetUserGroupsReqData)
  data: GetUserGroupsReqData;
}

class GetUserGroupsResMeta {
  @IsOptional()
  @IsString()
  endCursor?: string;

  @IsBoolean()
  hasNextPage: boolean;
}

class GetUserGroupsResData {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => GroupDto)
  items: GroupDto[];

  @ValidateNested()
  @Type(() => GetUserGroupsResMeta)
  meta: GetUserGroupsResMeta;
}

class GetUserGroupsRes {
  @ValidateNested()
  @Type(() => GetUserGroupsResData)
  data: GetUserGroupsResData;
}

export { GetUserGroupsReq, GetUserGroupsRes };
