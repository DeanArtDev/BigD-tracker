import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class CompleteDeleteTaskResData {
  @ApiProperty({ example: 123 })
  @Expose()
  @IsInt()
  id: number;
}

class CompleteDeleteTaskRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => CompleteDeleteTaskResData)
  data: CompleteDeleteTaskResData;
}

export { CompleteDeleteTaskRes };
