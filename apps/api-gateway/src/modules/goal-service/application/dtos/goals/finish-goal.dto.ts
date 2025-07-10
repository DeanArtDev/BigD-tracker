import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsISO8601, IsString, ValidateNested } from 'class-validator';

class FinishGoalReqData {
  @ApiProperty({ example: '2025-05-24T13:01:02.471Z' })
  @Expose()
  @IsISO8601()
  @IsString()
  endDate: string;
}

class FinishGoalReq {
  @ApiProperty({
    description: 'Ответ сервера',
    type: FinishGoalReqData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => FinishGoalReqData)
  data: FinishGoalReqData;
}

class FinishGoalRes {
  @IsBoolean()
  data: boolean;
}

export { FinishGoalRes, FinishGoalReq };
