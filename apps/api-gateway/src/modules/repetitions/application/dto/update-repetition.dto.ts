import { OmitType } from '@nestjs/swagger';
import { RepetitionDto } from './repetition.dto';

class UpdateRepetitionDto extends OmitType(RepetitionDto, [
  'userId',
  'factBreak',
  'factWeight',
  'factCount',
  'finishType',
] as const) {}

export { UpdateRepetitionDto };
