import { CreateExerciseReq, CreateExerciseRes } from './dtos';

export namespace TrainingCreateExercise {
  export const pattern = 'training.create.command';
  export class Request extends CreateExerciseReq {}
  export class Response extends CreateExerciseRes {}
}
