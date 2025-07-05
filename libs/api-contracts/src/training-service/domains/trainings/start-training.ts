import { StartTrainingReq, StartTrainingRes } from './dtos';

export namespace TrainingStartTraining {
  export const pattern = 'training.start-training.command';
  export class Request extends StartTrainingReq {}
  export class Response extends StartTrainingRes {}
}
