import { GetActiveTrainingReq, GetActiveTrainingRes } from './dtos';

export namespace TrainingGetActiveTraining {
  export const pattern = 'training.get-active-training.query';
  export class Request extends GetActiveTrainingReq {}
  export class Response extends GetActiveTrainingRes {}
}
