import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { GoalResSingle } from '../shared';

class CreateGoalReqData {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'Название цели' })
  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание' })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;
}

class CreateGoalReq {
  @ApiProperty({
    description: 'Ответ сервера',
    type: CreateGoalReqData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => CreateGoalReqData)
  data: CreateGoalReqData;
}

class CreateGoalRes extends GoalResSingle {}

export { CreateGoalRes, CreateGoalReq };
