import { UpdateExerciseReq, UpdateExerciseRes } from './dtos';

export namespace TrainingUpdateExercise {
  export const pattern = 'training.update.command';
  export class Request extends UpdateExerciseReq {}
  export class Response extends UpdateExerciseRes {}
}
