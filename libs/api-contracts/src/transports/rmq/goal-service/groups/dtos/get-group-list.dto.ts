import { CursorPaginationDto, CursorPaginationMetaDto } from '@/transports/rmq/shared/dto';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { GroupDto } from './group.dto';

class GetGroupListReqData extends CursorPaginationDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  search?: string;
}

class GetGroupListReq {
  @ValidateNested()
  @Type(() => GetGroupListReqData)
  data: GetGroupListReqData;
}

class GetGroupListResData {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => GroupDto)
  items: GroupDto[];

  @ValidateNested()
  @Type(() => CursorPaginationMetaDto)
  meta: CursorPaginationMetaDto;
}

class GetGroupListRes {
  @ValidateNested()
  @Type(() => GetGroupListResData)
  data: GetGroupListResData;
}

export { GetGroupListReq, GetGroupListRes };
