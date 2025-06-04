import { OmitType } from '@nestjs/swagger';
import { TrainingDto } from './training.dto';

class TrainingTemplateDto extends OmitType(TrainingDto, ['startDate', 'endDate'] as const) {}

export { TrainingTemplateDto };
