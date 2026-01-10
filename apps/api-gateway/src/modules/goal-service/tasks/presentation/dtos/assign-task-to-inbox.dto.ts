import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, ValidateNested } from 'class-validator';

class AssignTaskToInboxResData {
  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  success: boolean;
}

class AssignTaskToInboxRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => AssignTaskToInboxResData)
  data: AssignTaskToInboxResData;
}

export { AssignTaskToInboxRes };
