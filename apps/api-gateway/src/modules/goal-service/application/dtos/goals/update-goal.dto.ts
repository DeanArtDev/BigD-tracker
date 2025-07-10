import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { GoalResSingle } from '../shared';

class UpdateGoalReqData {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'Название группы' })
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

class UpdateGoalReq {
  @ApiProperty({
    description: 'Ответ сервера',
    type: UpdateGoalReqData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => UpdateGoalReqData)
  data: UpdateGoalReqData;
}

class UpdateGoalRes extends GoalResSingle {}

export { UpdateGoalRes, UpdateGoalReq };
