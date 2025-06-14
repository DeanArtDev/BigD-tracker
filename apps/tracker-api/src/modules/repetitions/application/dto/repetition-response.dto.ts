import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RepetitionDto } from './repetition.dto';

class RepetitionsResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: RepetitionDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepetitionDto)
  data: RepetitionDto[];
}

class RepetitionsResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: RepetitionDto,
  })
  @Type(() => RepetitionDto)
  data: RepetitionDto;
}

export { RepetitionsResponse, RepetitionsResponseSingle };
