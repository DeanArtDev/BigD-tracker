import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, ValidateNested } from 'class-validator';

class AssignTaskToGroupResData {
  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  success: boolean;
}

class AssignTaskToGroupRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => AssignTaskToGroupResData)
  data: AssignTaskToGroupResData;
}

export { AssignTaskToGroupRes };
