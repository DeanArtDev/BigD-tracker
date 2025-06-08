import { OmitType } from '@nestjs/swagger';
import { RepetitionsDto } from './repetitions.dto';

class CreateRepetitionsDto extends OmitType(RepetitionsDto, [
  'id',
  'userId',
  'factBreak',
  'factWeight',
  'factCount',
  'finishType',
  'exerciseId',
] as const) {}

export { CreateRepetitionsDto };
