import { TaskDto } from '@/modules/goal-service/tasks';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';

class GetInBoxResData {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Имя inbox' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Список дел',
    type: TaskDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => TaskDto)
  tasks: TaskDto[];
}

class GetInBoxRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: GetInBoxResData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => GetInBoxResData)
  data: GetInBoxResData;
}

export { GetInBoxRes };
