import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, ValidateNested } from 'class-validator';

class UnassignTaskFromGroupResData {
  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  success: boolean;
}

class UnassignTaskFromGroupRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => UnassignTaskFromGroupResData)
  data: UnassignTaskFromGroupResData;
}

export { UnassignTaskFromGroupRes };
