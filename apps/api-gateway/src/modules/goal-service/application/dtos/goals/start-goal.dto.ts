import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsISO8601, IsString, ValidateNested } from 'class-validator';

class StartGoalReqData {
  @ApiProperty({ example: '2025-05-24T13:01:02.471Z' })
  @Expose()
  @IsISO8601()
  @IsString()
  deadline: string;

  @ApiProperty({ example: '2025-05-24T13:01:02.471Z' })
  @Expose()
  @IsISO8601()
  @IsString()
  startDate: string;
}

class StartGoalReq {
  @ApiProperty({
    description: 'Ответ сервера',
    type: StartGoalReqData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => StartGoalReqData)
  data: StartGoalReqData;
}

class StartGoalRes {
  @IsBoolean()
  data: boolean;
}

export { StartGoalRes, StartGoalReq };
