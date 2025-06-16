import { OmitType } from '@nestjs/swagger';
import { RepetitionDto } from './repetition.dto';

class CreateRepetitionDto extends OmitType(RepetitionDto, [
  'id',
  'userId',
  'factBreak',
  'factWeight',
  'factCount',
  'finishType',
] as const) {}

export { CreateRepetitionDto };
