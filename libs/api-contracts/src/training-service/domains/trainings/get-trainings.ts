import { GetTrainingsReq, GetTrainingsRes } from './dtos';

export namespace TrainingGetTrainings {
  export const pattern = 'training.get-trainings.query';
  export class Request extends GetTrainingsReq {}
  export class Response extends GetTrainingsRes {}
}
