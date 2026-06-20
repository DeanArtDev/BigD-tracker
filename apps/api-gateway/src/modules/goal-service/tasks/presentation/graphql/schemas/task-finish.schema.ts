import { TaskFinishStatus } from '@big-d/api-contracts';
import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

registerEnumType(TaskFinishStatus, {
  name: 'TaskFinishStatus',
  description: 'Статус завершения дела',
});

@InputType()
class TaskFinishInput {
  @ApiProperty({ example: 'o:1' })
  @Field(() => String)
  @IsString()
  id: string;

  @ApiPropertyOptional({
    example: 'Не получилось',
    description: 'Описание причины просрочки или отказа',
  })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    example: TaskFinishStatus.COMPLETED,
    description: 'Тип завершения дела',
    enum: TaskFinishStatus,
  })
  @Field(() => TaskFinishStatus)
  @IsEnum(TaskFinishStatus)
  type: TaskFinishStatus;
}

export { TaskFinishInput };
