import { AssignTrainingsReq, AssignTrainingsRes } from './dtos';

export namespace TrainingAssignTrainings {
  export const pattern = 'training.assign-trainings.command';
  export class Request extends AssignTrainingsReq {}
  export class Response extends AssignTrainingsRes {}
}
