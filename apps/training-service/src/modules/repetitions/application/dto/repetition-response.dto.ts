import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RepetitionDto } from './repetition.dto';

class RepetitionsResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepetitionDto)
  data: RepetitionDto[];
}

class RepetitionsResponseSingle {
  @Type(() => RepetitionDto)
  data: RepetitionDto;
}

export { RepetitionsResponse, RepetitionsResponseSingle };
