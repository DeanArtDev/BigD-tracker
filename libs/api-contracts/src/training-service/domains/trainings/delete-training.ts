import { DeleteTrainingRes, DeleteTrainingReq } from './dtos';

export namespace TrainingDeleteTraining {
  export const pattern = 'training.delete-training.command';
  export class Request extends DeleteTrainingReq {}
  export class Response extends DeleteTrainingRes {}
}
