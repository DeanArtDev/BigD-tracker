import { UpdateTrainingRes, UpdateTrainingReq } from './dtos';

export namespace TrainingUpdateTraining {
  export const pattern = 'training.update-training.command';
  export class Request extends UpdateTrainingReq {}
  export class Response extends UpdateTrainingRes {}
}
