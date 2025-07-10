import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class FinishThingReqData {
  @ApiPropertyOptional({ example: '2025-05-24T13:01:02.471Z' })
  @Expose()
  @IsISO8601()
  @IsString()
  endDate: string;

  @ApiPropertyOptional({ example: 'Комментарий к завершению дела' })
  @Expose()
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: 40, description: 'От 0 до 100' })
  @Expose()
  @IsInt()
  @Min(0)
  @Max(100)
  result: number;
}

class FinishThingReq {
  @ApiProperty({
    description: 'Ответ сервера',
    type: FinishThingReqData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => FinishThingReqData)
  data: FinishThingReqData;
}

class FinishThingRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @IsBoolean()
  data: boolean;
}

export { FinishThingReq, FinishThingRes };
