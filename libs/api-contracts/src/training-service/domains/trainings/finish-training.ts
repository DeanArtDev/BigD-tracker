import { FinishTrainingRes, FinishTrainingReq } from './dtos';

export namespace TrainingFinishTraining {
  export const pattern = 'training.finish-training.command';
  export class Request extends FinishTrainingReq {}
  export class Response extends FinishTrainingRes {}
}
