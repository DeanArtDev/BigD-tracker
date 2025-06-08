import { OmitType } from '@nestjs/swagger';
import { RepetitionsDto } from './repetitions.dto';

class UpdateRepetitionsDto extends OmitType(RepetitionsDto, [
  'userId',
  'factBreak',
  'factWeight',
  'factCount',
  'finishType',
  'exerciseId',
] as const) {}

export { UpdateRepetitionsDto };
