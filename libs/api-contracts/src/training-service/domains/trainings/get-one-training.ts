import { GetOneTrainingRes, GetOneTrainingReq } from './dtos';

export namespace TrainingGetOneTraining {
  export const pattern = 'training.get-one-training.query';
  export class Request extends GetOneTrainingReq {}
  export class Response extends GetOneTrainingRes {}
}
