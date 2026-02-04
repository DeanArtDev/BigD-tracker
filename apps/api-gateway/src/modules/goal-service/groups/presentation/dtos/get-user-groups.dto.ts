import { CursorPaginationQueryDto, CursorPaginationResDto } from '@shared/dto';
import { GroupDto } from './shared/group.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

class GetUserGroupsResData {
  @ApiProperty({
    description: 'Ответ сервера',
    type: GroupDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  items: GroupDto[];

  @ApiProperty({
    description: 'Метаинформация',
    type: CursorPaginationResDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => CursorPaginationResDto)
  meta: CursorPaginationResDto;
}

class GetUserGroupsRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: GetUserGroupsResData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => GetUserGroupsResData)
  data: GetUserGroupsResData;
}

class GetUserGroupsQuery extends CursorPaginationQueryDto {
  @ApiPropertyOptional({
    example: 'Имя группы',
    description: 'Очень важная группа',
  })
  @Expose()
  @IsOptional()
  @IsString()
  search: string;

  @ApiPropertyOptional({
    example: 'priority,tasks_count,progress',
    description: 'Сортировка по дефолту id',
    isArray: true,
  })
  @Expose()
  @IsOptional()
  @Type(() => String)
  @IsArray()
  sort?: string[];

  @ApiPropertyOptional({
    example: 'status',
    description: 'Фильтрация',
    isArray: true,
  })
  @Expose()
  @IsOptional()
  @Type(() => String)
  @IsArray()
  filter?: string[];
}

export { GetUserGroupsRes, GetUserGroupsQuery };
