import { TrainingType } from './entities/training.entity';
import { TrainingTemplateDto } from './dtos/training-template.dto';

const mapRawTrainingTemplateToDto = (data: {
  id: number;
  user_id: number | null;
  description: string | null;
  type: string;
  created_at: Date;
  name: string;
  post_training_duration: number | null;
  updated_at: Date;
  worm_up_duration: number | null;
}): TrainingTemplateDto => {
  return {
    id: data.id,
    userId: data.user_id ?? Infinity,
    name: data.name,
    type: data.type as TrainingType,
    description: data.description ?? undefined,
    wormUpDuration: data.worm_up_duration ?? undefined,
    postTrainingDuration: data.post_training_duration ?? undefined,
    createdAt: data.created_at.toISOString(),
    updatedAt: data.created_at.toISOString(),
  };
};

export { mapRawTrainingTemplateToDto };
