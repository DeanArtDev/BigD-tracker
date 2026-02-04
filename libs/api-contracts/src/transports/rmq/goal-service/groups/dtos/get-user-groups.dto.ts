import { CursorPaginationQueryDto } from '@transports/rmq/shared';
import { GroupDto } from './group.dto';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

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
  cursor?: string;
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
