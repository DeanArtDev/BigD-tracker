import { CreateTrainingReq, CreateTrainingRes } from './dtos';

export namespace TrainingCreateTraining {
  export const pattern = 'training.create-training.command';
  export class Request extends CreateTrainingReq {}
  export class Response extends CreateTrainingRes {}
}
